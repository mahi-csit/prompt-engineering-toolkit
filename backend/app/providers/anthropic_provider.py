"""
Anthropic Claude provider implementation.
"""
from typing import Optional
from .base import BaseLLMProvider


class AnthropicProvider(BaseLLMProvider):

    provider_name = "anthropic"

    def __init__(self, api_key: str):
        import anthropic
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    async def complete(
        self,
        prompt: str,
        model: str = "claude-3-haiku-20240307",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system: Optional[str] = None,
    ) -> str:
        kwargs = dict(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        if system:
            kwargs["system"] = system

        response = await self.client.messages.create(**kwargs)
        return response.content[0].text if response.content else ""

    def get_available_models(self) -> list[dict]:
        return [
            {
                "provider": "anthropic",
                "model": "claude-3-haiku-20240307",
                "display_name": "Claude 3 Haiku",
                "description": "Fastest Claude model. Great for quick tasks.",
                "max_tokens": 4096,
            },
            {
                "provider": "anthropic",
                "model": "claude-3-sonnet-20240229",
                "display_name": "Claude 3 Sonnet",
                "description": "Balanced performance and speed.",
                "max_tokens": 4096,
            },
        ]
