"""
Prompt routes: CRUD, versioning, render, categories, import/export.
Uses Beanie directly — no SQLAlchemy session.
"""
import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from ..core.security import get_current_user_optional
from ..schemas.prompt import (
    PromptCreate, PromptUpdate, PromptResponse, PromptListResponse,
    PromptVersionResponse, RenderRequest, RenderResponse,
    ImportPromptRequest, ExportPromptResponse,
)
from ..services.prompt_service import PromptService

router = APIRouter()


# ── CATEGORIES (before /{prompt_id} to avoid conflicts) ──────────────────

@router.get("/categories/list", response_model=list[str])
async def list_categories():
    return await PromptService.get_categories()


# ── RENDER ────────────────────────────────────────────────────────────────

@router.post("/render", response_model=RenderResponse)
async def render_prompt(data: RenderRequest):
    result = await PromptService.render_prompt(str(data.prompt_id), data.variable_values)
    return RenderResponse(**result)


# ── IMPORT ────────────────────────────────────────────────────────────────

@router.post("/import", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def import_prompt(
    data: ImportPromptRequest,
    current_user=Depends(get_current_user_optional),
):
    user_id = str(current_user.id) if current_user else None
    prompt = await PromptService.import_prompt(data.model_dump(), user_id=user_id)
    return _to_response(prompt)


# ── CRUD ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    data: PromptCreate,
    current_user=Depends(get_current_user_optional),
):
    user_id = str(current_user.id) if current_user else None
    prompt = await PromptService.create_prompt(data, user_id=user_id)
    return _to_response(prompt)


@router.get("/", response_model=PromptListResponse)
async def list_prompts(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    favorites_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user_optional),
):
    prompts, total = await PromptService.list_prompts(
        query=query,
        category=category,
        tags=tags,
        favorites_only=favorites_only,
        page=page,
        page_size=page_size,
    )
    return PromptListResponse(
        items=[_to_response(p) for p in prompts],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(prompt_id: str):
    prompt = await PromptService.get_prompt(prompt_id)
    return _to_response(prompt)


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(prompt_id: str, data: PromptUpdate):
    prompt = await PromptService.update_prompt(prompt_id, data)
    return _to_response(prompt)


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(prompt_id: str):
    await PromptService.delete_prompt(prompt_id)


# ── VERSIONS ──────────────────────────────────────────────────────────────

@router.get("/{prompt_id}/versions", response_model=list[PromptVersionResponse])
async def get_versions(prompt_id: str):
    versions = await PromptService.get_versions(prompt_id)
    return [_to_version_response(v) for v in versions]


@router.post("/{prompt_id}/versions/{version_number}/rollback", response_model=PromptResponse)
async def rollback_version(prompt_id: str, version_number: int):
    prompt = await PromptService.rollback_to_version(prompt_id, version_number)
    return _to_response(prompt)


# ── EXPORT ────────────────────────────────────────────────────────────────

@router.get("/{prompt_id}/export", response_model=ExportPromptResponse)
async def export_prompt(prompt_id: str):
    data = await PromptService.export_prompt(prompt_id)
    return ExportPromptResponse(
        prompt=_to_response(data["prompt"]),
        versions=[_to_version_response(v) for v in data["versions"]],
        exported_at=data["exported_at"],
    )


# ── Helpers ───────────────────────────────────────────────────────────────

def _to_response(prompt) -> PromptResponse:
    return PromptResponse(
        id=str(prompt.id),
        user_id=str(prompt.user_id) if prompt.user_id else None,
        title=prompt.title,
        category=prompt.category,
        content=prompt.content,
        description=prompt.description,
        tags=prompt.tags,
        variables=prompt.variables,
        is_favorite=prompt.is_favorite,
        version_number=prompt.version_number,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


def _to_version_response(v) -> PromptVersionResponse:
    return PromptVersionResponse(
        id=str(v.id),
        prompt_id=str(v.prompt_id),
        version_number=v.version_number,
        content=v.content,
        variables=v.variables,
        change_note=v.change_note,
        created_by=v.created_by,
        created_at=v.created_at,
    )
