"""
Pydantic schemas for Prompt Evaluation and Optimization.
IDs are strings (MongoDB ObjectId serialised as str).
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class EvaluationRequest(BaseModel):
    prompt_id: str
    model: str = "gpt-3.5-turbo"
    provider: str = "openai"


class EvaluationResponse(BaseModel):
    id: str
    prompt_id: str
    model_name: str
    clarity: Optional[float] = None
    specificity: Optional[float] = None
    context_score: Optional[float] = None
    grammar: Optional[float] = None
    completeness: Optional[float] = None
    creativity: Optional[float] = None
    overall_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    created_at: datetime


class OptimizeRequest(BaseModel):
    prompt: str
    goal: Optional[str] = "improve clarity and effectiveness"
    context: Optional[str] = None
    model: str = "gpt-3.5-turbo"
    provider: str = "openai"


class OptimizeResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    changes_made: List[str]
    explanation: str
