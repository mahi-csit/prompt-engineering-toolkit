"""
MongoDB connection using Motor (async driver) + Beanie ODM.
Call init_db() once at application startup.
"""
from typing import Any, Optional
import certifi
import motor.motor_asyncio
try:
    import mongomock_motor
except ImportError:
    mongomock_motor = None

from beanie import init_beanie
from .config import settings
from .logging import get_logger

logger = get_logger(__name__)

# Shared Motor client — created once, reused across requests
_client: Optional[Any] = None
_is_mock: bool = False


def get_client() -> Any:
    global _client, _is_mock
    if _client is None:
        if not settings.MONGODB_URL or settings.MONGODB_URL.strip() == "":
            logger.info("No MONGODB_URL provided. Using in-memory MongoMock storage.")
            if mongomock_motor is None:
                raise RuntimeError("mongomock-motor is required for in-memory fallback but is not installed.")
            _client = mongomock_motor.AsyncMongoMockClient()
            _is_mock = True
        else:
            kwargs = {"serverSelectionTimeoutMS": 5000}
            if "mongodb+srv://" in settings.MONGODB_URL:
                kwargs["tlsCAFile"] = certifi.where()
            _client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
            _is_mock = False
    return _client


async def init_db() -> None:
    """
    Initialise Beanie with all document models.
    Must be called once during application startup.
    """
    global _client, _is_mock
    from ..models.user import User
    from ..models.prompt import Prompt, PromptVersion, Evaluation

    client = get_client()
    db = client[settings.MONGODB_DB_NAME]

    try:
        if not _is_mock:
            # Test connection to Atlas
            await client.admin.command('ping')
            logger.info("Successfully connected to MongoDB Atlas!")
        await init_beanie(
            database=db,
            document_models=[User, Prompt, PromptVersion, Evaluation],
        )
    except Exception as exc:
        logger.warning(
            "Could not connect to MongoDB Atlas (%s). Falling back to in-memory MongoMock database.\n"
            "Tip: Ensure your current IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).",
            exc,
        )
        if mongomock_motor is None:
            raise RuntimeError(f"Could not connect to MongoDB Atlas and mongomock-motor is not installed: {exc}")
        _client = mongomock_motor.AsyncMongoMockClient()
        _is_mock = True
        db = _client[settings.MONGODB_DB_NAME]
        await init_beanie(
            database=db,
            document_models=[User, Prompt, PromptVersion, Evaluation],
        )


async def close_db() -> None:
    """Close the Motor client on shutdown."""
    global _client, _is_mock
    if _client is not None:
        if hasattr(_client, "close"):
            _client.close()
        _client = None
        _is_mock = False
