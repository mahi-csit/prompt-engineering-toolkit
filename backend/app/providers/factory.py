"""
Provider factory — instantiates LLM providers based on available API keys.
"""
from typing import Optional, Dict
from ..core.config import settings
from .base import BaseLLMProvider


_providers: Dict[str, BaseLLMProvider] = {}


def get_provider(provider_name: str) -> BaseLLMProvider:
    """Return a cached provider instance or raise if unavailable."""
    if provider_name in _providers:
        return _providers[provider_name]

    if provider_name == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        from .openai_provider import OpenAIProvider
        _providers["openai"] = OpenAIProvider(api_key=settings.OPENAI_API_KEY)

    elif provider_name == "gemini":
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not configured")
        from .gemini_provider import GeminiProvider
        _providers["gemini"] = GeminiProvider(api_key=settings.GEMINI_API_KEY)

    elif provider_name == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY not configured")
        from .anthropic_provider import AnthropicProvider
        _providers["anthropic"] = AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)

    elif provider_name == "mock":
        from .mock_provider import MockProvider
        _providers["mock"] = MockProvider()

    else:
        raise ValueError(f"Unknown provider: {provider_name}")

    return _providers[provider_name]


def clear_cached_provider(provider_name: Optional[str] = None):
    """Clear cached provider instance so new API keys take effect immediately."""
    if provider_name and provider_name in _providers:
        del _providers[provider_name]
    elif not provider_name:
        _providers.clear()



def get_available_providers() -> list[dict]:
    """Return list of providers with their availability status."""
    providers = []
    
    # Demo Models (always available)
    providers.append({
        "provider": "mock",
        "display_name": "Demo Models (Free)",
        "available": True,
        "models": ["demo-fast", "demo-creative", "demo-detailed"],
    })
    
    # OpenAI
    if settings.OPENAI_API_KEY:
        providers.append({
            "provider": "openai",
            "display_name": "OpenAI",
            "available": True,
            "models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"],
        })
    
    # Google Gemini
    if settings.GEMINI_API_KEY:
        providers.append({
            "provider": "gemini",
            "display_name": "Google Gemini",
            "available": True,
            "models": ["gemini-2.0-flash"],
        })
    
    # Anthropic Claude
    if settings.ANTHROPIC_API_KEY:
        providers.append({
            "provider": "anthropic",
            "display_name": "Anthropic Claude",
            "available": True,
            "models": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229"],
        })
    
    return providers


def get_all_models() -> list[dict]:
    """Return all known models regardless of key availability."""
    # Build statically to avoid instantiation without keys
    all_models = [
        # Demo Models
        {"provider": "mock", "model": "demo-fast", "display_name": "Demo Fast", "description": "Quick, concise responses. Perfect for rapid testing.", "max_tokens": 1024},
        {"provider": "mock", "model": "demo-creative", "display_name": "Demo Creative", "description": "Creative, fun responses with examples and emojis.", "max_tokens": 2048},
        {"provider": "mock", "model": "demo-detailed", "display_name": "Demo Detailed", "description": "Comprehensive, detailed responses with thorough explanations.", "max_tokens": 4096},
        
        # OpenAI models
        {"provider": "openai", "model": "gpt-3.5-turbo", "display_name": "GPT-3.5 Turbo", "description": "Fast and efficient for most tasks.", "max_tokens": 4096},
        {"provider": "openai", "model": "gpt-4", "display_name": "GPT-4", "description": "Most capable model for complex reasoning.", "max_tokens": 8192},
        {"provider": "openai", "model": "gpt-4-turbo-preview", "display_name": "GPT-4 Turbo", "description": "Latest GPT-4 with improved performance.", "max_tokens": 128000},
        
        # Google Gemini models
        {"provider": "gemini", "model": "gemini-2.0-flash", "display_name": "Gemini 2.0 Flash", "description": "Fast and capable multimodal model.", "max_tokens": 1000000},
        
        # Anthropic Claude models
        {"provider": "anthropic", "model": "claude-3-5-sonnet-20241022", "display_name": "Claude 3.5 Sonnet", "description": "Latest Claude with improved reasoning.", "max_tokens": 200000},
        {"provider": "anthropic", "model": "claude-3-opus-20240229", "display_name": "Claude 3 Opus", "description": "Most capable Claude model for complex tasks.", "max_tokens": 200000},
        {"provider": "anthropic", "model": "claude-3-sonnet-20240229", "display_name": "Claude 3 Sonnet", "description": "Balanced performance and speed.", "max_tokens": 200000},
    ]
    return all_models
