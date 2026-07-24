"""
OpenAI GPT provider implementation.
"""
from typing import Optional
from .base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):

    provider_name = "openai"

    def __init__(self, api_key: str):
        import openai
        self.client = openai.AsyncOpenAI(api_key=api_key)

    async def complete(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system: Optional[str] = None,
    ) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    def get_available_models(self) -> list[dict]:
        return [
            {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "display_name": "GPT-3.5 Turbo",
                "description": "Fast and capable. Great for most tasks.",
                "max_tokens": 4096,
            },
            {
                "provider": "openai",
                "model": "gpt-4",
                "display_name": "GPT-4",
                "description": "Most capable OpenAI model. Best for complex reasoning.",
                "max_tokens": 8192,
            },
            {
                "provider": "openai",
                "model": "gpt-4-turbo-preview",
                "display_name": "GPT-4 Turbo",
                "description": "Latest GPT-4 with 128k context window.",
                "max_tokens": 4096,
            },
        ]
