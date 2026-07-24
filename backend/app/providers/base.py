"""
Base LLM provider interface. All providers must implement this.
"""
from abc import ABC, abstractmethod
from typing import Optional


class BaseLLMProvider(ABC):

    @abstractmethod
    async def complete(
        self,
        prompt: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system: Optional[str] = None,
    ) -> str:
        """Return the text completion for a prompt."""
        ...

    @abstractmethod
    def get_available_models(self) -> list[dict]:
        """Return list of available model info dicts."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...
