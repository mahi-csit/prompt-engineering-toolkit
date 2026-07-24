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
    allow_origin_regex=r"https://.*\.vercel\.app" if origins != ["*"] else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



from fastapi.responses import HTMLResponse, RedirectResponse


@app.get("/", response_class=HTMLResponse, tags=["root"])
async def root():
    return """
    <!Timeline html>
    <html>
    <head>
        <title>Enterprise Prompt Engineering Toolkit API</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 50px 20px; }
            .card { background: #1e293b; border-radius: 12px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; margin-bottom: 10px; }
            p { color: #94a3b8; line-height: 1.6; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px; transition: background 0.2s; }
            .btn:hover { background: #1d4ed8; }
            .btn-secondary { background: #334155; }
            .btn-secondary:hover { background: #475569; }
            .status { display: inline-block; background: #10b981; color: #022c22; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="status">⚡ Backend Service Live</div>
            <h1>Enterprise Prompt Engineering Toolkit API</h1>
            <p>Welcome to the production API server. Use the interactive Swagger documentation below to explore and test API endpoints.</p>
            <a href="/api/docs" class="btn">🚀 Open API Docs (Swagger)</a>
            <a href="/health" class="btn btn-secondary">🔍 Health Check</a>
        </div>
    </body>
    </html>
    """


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
