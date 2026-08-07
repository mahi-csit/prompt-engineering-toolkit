"""
Pydantic schemas for Prompt, PromptVersion, and related operations.
IDs are strings (MongoDB ObjectId serialised as str).
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, field_validator

VALID_CATEGORIES = [
    "Coding", "Marketing", "Education", "Business",
    "Translation", "Writing", "Resume", "Email",
    "Social Media", "General", "Other",
]


class PromptCreate(BaseModel):
    title: str
    category: Optional[str] = "General"
    content: str
    description: Optional[str] = None
    tags: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    variations: Optional[List[Dict[str, Any]]] = None
    is_favorite: bool = False
    parent_id: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) > 255:
            raise ValueError("Title must be at most 255 characters")
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Content cannot be empty")
        return v


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    variations: Optional[List[Dict[str, Any]]] = None
    is_favorite: Optional[bool] = None
    parent_id: Optional[str] = None


class PromptResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    parent_id: Optional[str] = None
    title: str
    category: Optional[str] = None
    content: str
    description: Optional[str] = None
    tags: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    variations: Optional[List[Dict[str, Any]]] = None
    is_favorite: bool
    version_number: int
    created_at: datetime
    updated_at: datetime


class PromptListResponse(BaseModel):
    items: List[PromptResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PromptVersionResponse(BaseModel):
    id: str
    prompt_id: str
    version_number: int
    content: str
    variables: Optional[Dict[str, Any]] = None
    change_note: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime


class RenderRequest(BaseModel):
    prompt_id: str
    variable_values: Dict[str, str]


class RenderResponse(BaseModel):
    rendered_content: str
    original_content: str
    variables_used: List[str]


class ImportPromptRequest(BaseModel):
    title: str
    category: Optional[str] = "General"
    content: str
    description: Optional[str] = None
    tags: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None


class ExportPromptResponse(BaseModel):
    prompt: PromptResponse
    versions: List[PromptVersionResponse]
    exported_at: datetime


class GeneratePromptRequest(BaseModel):
    topic: str
    category: Optional[str] = None


class GeneratePromptResponse(BaseModel):
    title: str
    category: str
    description: str
    content: str
