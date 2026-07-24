"""
Pydantic schemas for Playground (model testing and comparison).
"""
from typing import Optional, List, Any
from pydantic import BaseModel, field_validator


class ModelConfig(BaseModel):
    provider: str           # "openai" | "gemini" | "anthropic"
    model: str
    temperature: float = 0.7
    max_tokens: int = 1024

    @field_validator("temperature")
    @classmethod
    def temp_range(cls, v: float) -> float:
        if not 0.0 <= v <= 2.0:
            raise ValueError("Temperature must be between 0 and 2")
        return v

    @field_validator("max_tokens")
    @classmethod
    def tokens_range(cls, v: int) -> int:
        if not 1 <= v <= 8192:
            raise ValueError("max_tokens must be between 1 and 8192")
        return v


class CompareRequest(BaseModel):
    prompt: str
    models: List[ModelConfig]

    @field_validator("prompt")
    @classmethod
    def prompt_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Prompt cannot be empty")
        return v

    @field_validator("models")
    @classmethod
    def models_not_empty(cls, v: List[ModelConfig]) -> List[ModelConfig]:
        if not v:
            raise ValueError("At least one model must be selected")
        if len(v) > 5:
            raise ValueError("At most 5 models can be compared at once")
        return v


class QuickTestRequest(BaseModel):
    prompt: str
    provider: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 1024


class ModelResponse(BaseModel):
    provider: str
    model: str
    response: Optional[str] = None
    error: Optional[str] = None
    latency_ms: int = 0
    token_usage: Optional[Any] = None
    success: bool = True


class CompareResponse(BaseModel):
    prompt: str
    responses: List[ModelResponse]
    total_latency_ms: int
    success_count: int
    failure_count: int


class ModelInfo(BaseModel):
    provider: str
    model: str
    display_name: str
    description: str
    max_tokens: int


class ProviderInfo(BaseModel):
    provider: str
    display_name: str
    available: bool
    models: List[str]
