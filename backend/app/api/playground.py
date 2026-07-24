"""
Playground routes: model comparison, quick-test, model/provider listings.
"""
from fastapi import APIRouter, HTTPException
from ..schemas.playground import (
    CompareRequest, CompareResponse,
    QuickTestRequest, ModelResponse,
    ModelInfo, ProviderInfo,
)
from ..services.playground_service import PlaygroundService
from ..providers.factory import get_available_providers, get_all_models

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
async def compare_models(data: CompareRequest):
    """Run a prompt against multiple models and return side-by-side results."""
    return await PlaygroundService.compare(data.prompt, data.models)


@router.post("/quick-test", response_model=ModelResponse)
async def quick_test(data: QuickTestRequest):
    """Run a prompt against a single model."""
    return await PlaygroundService.quick_test(
        prompt=data.prompt,
        provider=data.provider,
        model=data.model,
        temperature=data.temperature,
        max_tokens=data.max_tokens,
    )


@router.get("/models", response_model=list[ModelInfo])
async def list_models():
    """Return all available models across all providers."""
    return get_all_models()


@router.get("/models/{provider}", response_model=list[ModelInfo])
async def list_models_by_provider(provider: str):
    """Return models for a specific provider."""
    all_models = get_all_models()
    filtered = [m for m in all_models if m["provider"] == provider]
    if not filtered:
        raise HTTPException(status_code=404, detail=f"Provider '{provider}' not found")
    return filtered


@router.get("/providers", response_model=list[ProviderInfo])
async def list_providers():
    """Return available LLM providers and their configuration status."""
    return get_available_providers()
