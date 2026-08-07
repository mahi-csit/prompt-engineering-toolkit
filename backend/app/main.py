"""
FastAPI application entry point.
Configures the app, CORS middleware, lifespan, and all routers.
Uses MongoDB via Motor + Beanie ODM.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.database import init_db, close_db
from .core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect to MongoDB and initialise Beanie. Shutdown: close client."""
    logger.info("Starting Enterprise Prompt Engineering Toolkit — %s", settings.ENVIRONMENT)
    await init_db()
    logger.info("MongoDB connected — database: %s", settings.MONGODB_DB_NAME)
    try:
        from .services.auth_service import AuthService
        await AuthService.seed_demo_users()
        logger.info("Demo users seeded successfully")
    except Exception as e:
        logger.warning("Error seeding demo users: %s", e)
    yield
    await close_db()
    logger.info("MongoDB connection closed")


app = FastAPI(
    title="Enterprise Prompt Engineering Toolkit",
    description="Platform for creating, testing, versioning, evaluating, and comparing LLM prompts.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Enterprise Prompt Engineering Toolkit API",
        "docs": "/api/docs",
        "health": "/health",
        "version": "1.0.0",
        "frontend_url": "http://localhost:5173",
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "prompt-engineering-toolkit",
        "database": "mongodb",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }


# Register all routers
from .api import auth, prompts, playground, evaluations, analytics  # noqa: E402

app.include_router(auth.router,        prefix="/api/auth",        tags=["auth"])
app.include_router(prompts.router,     prefix="/api/prompts",     tags=["prompts"])
app.include_router(playground.router,  prefix="/api/playground",  tags=["playground"])
app.include_router(evaluations.router, prefix="/api/evaluations", tags=["evaluations"])
app.include_router(analytics.router,   prefix="/api/analytics",   tags=["analytics"])
