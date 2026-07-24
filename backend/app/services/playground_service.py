"""
Playground service: run prompts against one or many LLM models.
"""
import time
import asyncio
import logging
from typing import List

from ..schemas.playground import ModelConfig, ModelResponse, CompareResponse
from ..providers.factory import get_provider

logger = logging.getLogger(__name__)


class PlaygroundService:

    @staticmethod
    async def _run_single(prompt: str, cfg: ModelConfig) -> ModelResponse:
        start = time.monotonic()
        try:
            provider = get_provider(cfg.provider)
            text = await provider.complete(
                prompt=prompt,
                model=cfg.model,
                temperature=cfg.temperature,
                max_tokens=cfg.max_tokens,
            )
            latency_ms = int((time.monotonic() - start) * 1000)
            return ModelResponse(
                provider=cfg.provider,
                model=cfg.model,
                response=text,
                latency_ms=latency_ms,
                success=True,
            )
        except Exception as exc:
            latency_ms = int((time.monotonic() - start) * 1000)
            logger.warning("Model %s/%s failed: %s", cfg.provider, cfg.model, exc)
            return ModelResponse(
                provider=cfg.provider,
                model=cfg.model,
                error=str(exc),
                latency_ms=latency_ms,
                success=False,
            )

    @staticmethod
    async def compare(prompt: str, models: List[ModelConfig]) -> CompareResponse:
        tasks = [PlaygroundService._run_single(prompt, m) for m in models]
        responses: List[ModelResponse] = await asyncio.gather(*tasks)

        total_latency = sum(r.latency_ms for r in responses)
        success_count = sum(1 for r in responses if r.success)
        failure_count = len(responses) - success_count

        return CompareResponse(
            prompt=prompt,
            responses=responses,
            total_latency_ms=total_latency,
            success_count=success_count,
            failure_count=failure_count,
        )

    @staticmethod
    async def quick_test(
        prompt: str, provider: str, model: str,
        temperature: float = 0.7, max_tokens: int = 1024,
    ) -> ModelResponse:
        cfg = ModelConfig(
            provider=provider, model=model,
            temperature=temperature, max_tokens=max_tokens,
        )
        return await PlaygroundService._run_single(prompt, cfg)
