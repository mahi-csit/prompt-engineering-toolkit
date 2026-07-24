"""
Google Gemini provider implementation.
"""
from typing import Optional
from .base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):

    provider_name = "gemini"

    def __init__(self, api_key: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self._genai = genai

    async def complete(
        self,
        prompt: str,
        model: str = "gemini-3-flash-preview",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system: Optional[str] = None,
    ) -> str:
        import asyncio
        full_prompt = f"{system}\n\n{prompt}" if system else prompt

        gen_model = self._genai.GenerativeModel(model)
        # Gemini SDK is sync — run in thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: gen_model.generate_content(
                full_prompt,
                generation_config=self._genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                ),
            )
        )
        return response.text or ""

    def get_available_models(self) -> list[dict]:
        return [
            {
                "provider": "gemini",
                "model": "gemini-3-flash-preview",
                "display_name": "Gemini 3.0 Flash",
                "description": "Latest Gemini model with excellent speed and quality.",
                "max_tokens": 8192,
            },
        ]
