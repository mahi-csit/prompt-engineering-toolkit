"""
Prompt, PromptVersion, and Evaluation Beanie Document models for MongoDB.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document, PydanticObjectId
from pydantic import Field


class Prompt(Document):
    user_id: Optional[PydanticObjectId] = None
    title: str
    category: Optional[str] = "General"
    content: str
    description: Optional[str] = None
    tags: Optional[str] = None
    variables: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_favorite: bool = False
    version_number: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prompts"
        indexes = [
            [("title", 1)],
            [("category", 1)],
            [("user_id", 1)],
            [("updated_at", -1)],
        ]


class PromptVersion(Document):
    prompt_id: PydanticObjectId
    version_number: int
    content: str
    variables: Optional[Dict[str, Any]] = Field(default_factory=dict)
    change_note: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "prompt_versions"
        indexes = [
            [("prompt_id", 1)],
            [("version_number", 1)],
        ]


class Evaluation(Document):
    prompt_id: PydanticObjectId
    model_name: str
    clarity: Optional[float] = None
    specificity: Optional[float] = None
    context_score: Optional[float] = None
    grammar: Optional[float] = None
    completeness: Optional[float] = None
    creativity: Optional[float] = None
    overall_score: Optional[float] = None
    strengths: Optional[List[str]] = Field(default_factory=list)
    weaknesses: Optional[List[str]] = Field(default_factory=list)
    suggestions: Optional[List[str]] = Field(default_factory=list)
    raw_response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "evaluations"
        indexes = [
            [("prompt_id", 1)],
            [("overall_score", -1)],
        ]
