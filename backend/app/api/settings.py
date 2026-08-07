"""
Settings API routes — view and update API keys directly in backend/.env
"""
import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..core.config import settings
from ..providers import factory

router = APIRouter()


class UpdateApiKeyRequest(BaseModel):
    provider: str = "gemini"  # gemini, openai, anthropic
    api_key: str


class ApiKeyResponse(BaseModel):
    message: str
    provider: str
    is_configured: bool
    gemini_configured: bool
    openai_configured: bool
    anthropic_configured: bool


def _find_env_file() -> Path:
    """Find .env file location."""
    current_dir = Path(__file__).resolve().parent
    possible_paths = [
        Path(".env"),
        Path("backend/.env"),
        current_dir.parents[1] / ".env",
        current_dir.parents[1] / "backend" / ".env",
    ]
    for p in possible_paths:
        if p.exists() and p.is_file():
            return p
    
    # Fallback default
    default_path = current_dir.parents[1] / "backend" / ".env"
    default_path.parent.mkdir(parents=True, exist_ok=True)
    return default_path


def _update_env_file(key: str, value: str):
    """Write/Update environment variable in .env file on disk."""
    env_file = _find_env_file()
    lines = []
    if env_file.exists():
        lines = env_file.read_text(encoding="utf-8").splitlines()

    updated = False
    new_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith(f"{key}=") or stripped.startswith(f"# {key}="):
            new_lines.append(f"{key}={value}")
            updated = True
        else:
            new_lines.append(line)

    if not updated:
        new_lines.append(f"{key}={value}")

    env_file.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


@router.get("/status", response_model=ApiKeyResponse)
async def get_settings_status():
    """Get API Key configuration status."""
    return ApiKeyResponse(
        message="Settings status",
        provider="all",
        is_configured=bool(settings.GEMINI_API_KEY),
        gemini_configured=bool(settings.GEMINI_API_KEY),
        openai_configured=bool(settings.OPENAI_API_KEY),
        anthropic_configured=bool(settings.ANTHROPIC_API_KEY),
    )


@router.post("/update-api-key", response_model=ApiKeyResponse)
async def update_api_key(data: UpdateApiKeyRequest):
    """Update API Key in .env file and update runtime settings immediately."""
    provider = data.provider.lower().strip()
    key_val = data.api_key.strip()

    if provider == "gemini":
        env_var = "GEMINI_API_KEY"
        settings.GEMINI_API_KEY = key_val
    elif provider == "openai":
        env_var = "OPENAI_API_KEY"
        settings.OPENAI_API_KEY = key_val
    elif provider == "anthropic":
        env_var = "ANTHROPIC_API_KEY"
        settings.ANTHROPIC_API_KEY = key_val
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider '{provider}'. Must be gemini, openai, or anthropic."
        )

    # 1. Update OS environment variable
    os.environ[env_var] = key_val

    # 2. Write to .env file on disk
    _update_env_file(env_var, key_val)

    # 3. Clear cached provider in factory so new key is instantiated
    if hasattr(factory, "clear_cached_provider"):
        factory.clear_cached_provider(provider)
    elif provider in factory._providers:
        del factory._providers[provider]

    return ApiKeyResponse(
        message=f"{env_var} updated in .env and runtime successfully",
        provider=provider,
        is_configured=bool(key_val),
        gemini_configured=bool(settings.GEMINI_API_KEY),
        openai_configured=bool(settings.OPENAI_API_KEY),
        anthropic_configured=bool(settings.ANTHROPIC_API_KEY),
    )
