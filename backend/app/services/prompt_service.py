"""
Prompt service using Beanie (MongoDB).
Handles CRUD, versioning, rendering, import/export.
"""
from datetime import datetime
from typing import Optional, List, Tuple
from beanie import PydanticObjectId
from fastapi import HTTPException, status

from ..models.prompt import Prompt, PromptVersion
from ..schemas.prompt import PromptCreate, PromptUpdate

CATEGORIES = [
    "Coding", "Marketing", "Education", "Business",
    "Translation", "Writing", "Resume", "Email",
    "Social Media", "General", "Other",
]


class PromptService:

    # ── CRUD ──────────────────────────────────────────────────────────────

    @staticmethod
    async def create_prompt(data: PromptCreate, user_id: Optional[str] = None) -> Prompt:
        prompt = Prompt(
            user_id=PydanticObjectId(user_id) if user_id else None,
            title=data.title,
            category=data.category or "General",
            content=data.content,
            description=data.description,
            tags=data.tags,
            variables=data.variables or {},
            is_favorite=data.is_favorite,
            version_number=1,
        )
        await prompt.insert()

        # Save initial version
        version = PromptVersion(
            prompt_id=prompt.id,
            version_number=1,
            content=data.content,
            variables=data.variables or {},
            change_note="Initial version",
        )
        await version.insert()
        return prompt

    @staticmethod
    async def get_prompt(prompt_id: str) -> Prompt:
        try:
            prompt = await Prompt.get(PydanticObjectId(prompt_id))
        except Exception:
            prompt = None
        if not prompt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
        return prompt

    @staticmethod
    async def list_prompts(
        query: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[str] = None,
        favorites_only: bool = False,
        user_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Prompt], int]:
        # Build filter dict for Motor
        filter_dict: dict = {}
        if query:
            filter_dict["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}},
            ]
        if category:
            filter_dict["category"] = category
        if tags:
            filter_dict["tags"] = {"$regex": tags, "$options": "i"}
        if favorites_only:
            filter_dict["is_favorite"] = True

        find_query = Prompt.find(filter_dict)
        total = await find_query.count()
        prompts = (
            await find_query
            .sort(-Prompt.updated_at)
            .skip((page - 1) * page_size)
            .limit(page_size)
            .to_list()
        )
        return prompts, total

    @staticmethod
    async def update_prompt(prompt_id: str, data: PromptUpdate) -> Prompt:
        prompt = await PromptService.get_prompt(prompt_id)
        content_changed = data.content is not None and data.content != prompt.content

        if data.title is not None:
            prompt.title = data.title
        if data.category is not None:
            prompt.category = data.category
        if data.content is not None:
            prompt.content = data.content
        if data.description is not None:
            prompt.description = data.description
        if data.tags is not None:
            prompt.tags = data.tags
        if data.variables is not None:
            prompt.variables = data.variables
        if data.is_favorite is not None:
            prompt.is_favorite = data.is_favorite

        prompt.updated_at = datetime.utcnow()

        if content_changed:
            prompt.version_number += 1
            version = PromptVersion(
                prompt_id=prompt.id,
                version_number=prompt.version_number,
                content=prompt.content,
                variables=prompt.variables,
                change_note="Content updated",
            )
            await version.insert()

        await prompt.save()
        return prompt

    @staticmethod
    async def delete_prompt(prompt_id: str) -> None:
        prompt = await PromptService.get_prompt(prompt_id)
        # Delete all versions and evaluations for this prompt
        await PromptVersion.find(PromptVersion.prompt_id == prompt.id).delete()
        from ..models.prompt import Evaluation
        await Evaluation.find(Evaluation.prompt_id == prompt.id).delete()
        await prompt.delete()

    # ── VERSIONING ────────────────────────────────────────────────────────

    @staticmethod
    async def get_versions(prompt_id: str) -> List[PromptVersion]:
        prompt = await PromptService.get_prompt(prompt_id)
        return (
            await PromptVersion.find(PromptVersion.prompt_id == prompt.id)
            .sort(-PromptVersion.version_number)
            .to_list()
        )

    @staticmethod
    async def rollback_to_version(prompt_id: str, version_number: int) -> Prompt:
        prompt = await PromptService.get_prompt(prompt_id)
        version = await PromptVersion.find_one(
            PromptVersion.prompt_id == prompt.id,
            PromptVersion.version_number == version_number,
        )
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")

        prompt.content = version.content
        prompt.variables = version.variables
        prompt.version_number += 1
        prompt.updated_at = datetime.utcnow()

        new_version = PromptVersion(
            prompt_id=prompt.id,
            version_number=prompt.version_number,
            content=version.content,
            variables=version.variables,
            change_note=f"Rolled back to version {version_number}",
        )
        await new_version.insert()
        await prompt.save()
        return prompt

    # ── RENDER ────────────────────────────────────────────────────────────

    @staticmethod
    async def render_prompt(prompt_id: str, variable_values: dict) -> dict:
        prompt = await PromptService.get_prompt(prompt_id)
        content = prompt.content
        used = []
        for key, value in variable_values.items():
            placeholder = f"{{{{{key}}}}}"
            if placeholder in content:
                content = content.replace(placeholder, str(value))
                used.append(key)
        return {
            "rendered_content": content,
            "original_content": prompt.content,
            "variables_used": used,
        }

    # ── CATEGORIES ────────────────────────────────────────────────────────

    @staticmethod
    async def get_categories() -> List[str]:
        db_cats = await Prompt.distinct("category")
        db_cats = [c for c in db_cats if c]
        return list(dict.fromkeys(CATEGORIES + db_cats))

    # ── IMPORT / EXPORT ───────────────────────────────────────────────────

    @staticmethod
    async def export_prompt(prompt_id: str) -> dict:
        prompt = await PromptService.get_prompt(prompt_id)
        versions = await PromptService.get_versions(prompt_id)
        return {
            "prompt": prompt,
            "versions": versions,
            "exported_at": datetime.utcnow(),
        }

    @staticmethod
    async def import_prompt(data: dict, user_id: Optional[str] = None) -> Prompt:
        from ..schemas.prompt import PromptCreate
        create_data = PromptCreate(
            title=data.get("title", "Imported Prompt"),
            category=data.get("category", "General"),
            content=data.get("content", ""),
            description=data.get("description"),
            tags=data.get("tags"),
            variables=data.get("variables"),
        )
        return await PromptService.create_prompt(create_data, user_id=user_id)
