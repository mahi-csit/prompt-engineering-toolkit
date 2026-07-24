"""
MongoDB connection using Motor (async driver) + Beanie ODM.
Call init_db() once at application startup.
"""
import motor.motor_asyncio
from beanie import init_beanie
from .config import settings


# Shared Motor client — created once, reused across requests
_client: motor.motor_asyncio.AsyncIOMotorClient | None = None


import certifi


def get_client() -> motor.motor_asyncio.AsyncIOMotorClient:
    global _client
    if _client is None:
        kwargs = {}
        if "mongodb+srv://" in settings.MONGODB_URL:
            kwargs["tlsCAFile"] = certifi.where()
        _client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
    return _client



async def init_db():
    """
    Initialise Beanie with all document models.
    Must be called once during application startup.
    """
    from ..models.user import User
    from ..models.prompt import Prompt, PromptVersion, Evaluation

    client = get_client()
    db = client[settings.MONGODB_DB_NAME]

    await init_beanie(
        database=db,
        document_models=[User, Prompt, PromptVersion, Evaluation],
    )


async def close_db():
    """Close the Motor client on shutdown."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
