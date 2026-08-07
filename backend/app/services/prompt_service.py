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
        if data.parent_id:
            try:
                parent = await Prompt.get(PydanticObjectId(data.parent_id))
                if parent:
                    variation_obj = {
                        "id": str(PydanticObjectId()),
                        "title": data.title,
                        "content": data.content,
                        "description": data.description or "",
                        "category": data.category or "Playground Variations",
                        "created_at": datetime.utcnow().isoformat(),
                    }
                    if parent.variations is None:
                        parent.variations = []
                    parent.variations.append(variation_obj)
                    parent.updated_at = datetime.utcnow()
                    await parent.save()
                    return parent
            except Exception as e:
                logger.warning("Could not attach variation to parent prompt: %s", e)

        prompt = Prompt(
            user_id=PydanticObjectId(user_id) if user_id else None,
            parent_id=PydanticObjectId(data.parent_id) if data.parent_id else None,
            title=data.title,
            category=data.category or "General",
            content=data.content,
            description=data.description,
            tags=data.tags,
            variables=data.variables or {},
            variations=getattr(data, 'variations', None) or [],
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
        root_clause = {
            "$or": [
                {"parent_id": None},
                {"parent_id": {"$exists": False}},
            ]
        }
        
        filter_dict: dict = root_clause
        
        if query:
            search_clause = {
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"content": {"$regex": query, "$options": "i"}},
                ]
            }
            filter_dict = {"$and": [root_clause, search_clause]}

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

    # ── AI PROMPT GENERATOR ───────────────────────────────────────────────

    @staticmethod
    async def generate_prompt_template(topic: str, category: Optional[str] = None) -> dict:
        topic_clean = topic.strip()
        cat = category or "General"
        topic_lower = topic_clean.lower()

        if any(w in topic_lower for w in ["code", "python", "javascript", "react", "bug", "fix", "sql", "api", "review"]):
            title = f"{topic_clean.title()} Assistant"
            cat = category or "Coding"
            description = f"Structured AI prompt template for {topic_clean} development tasks."
            content = (
                f"You are an expert software engineer specializing in {{language}}.\n\n"
                f"Task: {{task_description}}\n\n"
                f"Code Context:\n```{{language}}\n{{code_snippet}}\n```\n\n"
                f"Instructions:\n"
                f"1. Review the code for bugs, efficiency, security, and readability.\n"
                f"2. Provide refactored code adhering to {{style_guide}} standards.\n"
                f"3. Explain all key changes clearly."
            )
        elif any(w in topic_lower for w in ["email", "mail", "outreach", "welcome", "newsletter"]):
            title = f"{topic_clean.title()} Template"
            cat = category or "Email"
            description = f"Professional template for generating {topic_clean} communications."
            content = (
                f"You are a communications specialist writing on behalf of {{company_name}}.\n\n"
                f"Recipient: {{recipient_name}} ({{recipient_role}})\n"
                f"Goal: {{email_purpose}}\n\n"
                f"Key Points:\n- {{key_point_1}}\n- {{key_point_2}}\n\n"
                f"Tone: {{tone_style}}\n\n"
                f"Write a clear, compelling email with a punchy subject line and call-to-action."
            )
        elif any(w in topic_lower for w in ["support", "customer", "refund", "ticket", "service"]):
            title = f"{topic_clean.title()} Response"
            cat = category or "Business"
            description = f"Customer service prompt template for {topic_clean}."
            content = (
                f"You are a helpful customer support representative for {{company_name}}.\n\n"
                f"Customer Name: {{customer_name}}\n"
                f"Issue / Request: {{customer_issue}}\n"
                f"Policy Guidelines: {{policy_summary}}\n\n"
                f"Craft a friendly, empathetic, and effective response that solves the customer's problem."
            )
        elif any(w in topic_lower for w in ["marketing", "ad", "social", "post", "blog", "copy"]):
            title = f"{topic_clean.title()} Generator"
            cat = category or "Marketing"
            description = f"High-converting marketing copy template for {topic_clean}."
            content = (
                f"You are a master copywriter crafting marketing material for {{product_name}}.\n\n"
                f"Target Audience: {{target_audience}}\n"
                f"Key Benefit: {{main_benefit}}\n"
                f"Call to Action: {{cta_objective}}\n\n"
                f"Write engaging copy for {{platform_name}} with a {{tone_style}} tone that drives action."
            )
        else:
            title = f"{topic_clean.title()} Prompt"
            description = f"Custom prompt template for {topic_clean}."
            content = (
                f"You are an expert AI assistant specialized in {{domain_topic}}.\n\n"
                f"Context & Background:\n{{background_context}}\n\n"
                f"Task:\n{{user_task}}\n\n"
                f"Requirements:\n"
                f"- Format: {{output_format}}\n"
                f"- Tone: {{tone_style}}\n"
                f"- Ensure high accuracy and actionable takeaways."
            )

        return {
            "title": title,
            "category": cat,
            "description": description,
            "content": content,
        }
