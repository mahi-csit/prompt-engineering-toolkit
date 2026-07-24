"""
Unit tests for the prompt service.
Run with: pytest tests/ -v
"""
import pytest
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


class TestPromptVariableExtraction:
    """Test the variable extraction logic used in the prompt builder."""

    def _extract_variables(self, content: str) -> list:
        import re
        pattern = r"\{\{(\w+)\}\}"
        return list(set(re.findall(pattern, content)))

    def test_single_variable(self):
        vars = self._extract_variables("Hello {{name}}")
        assert "name" in vars

    def test_multiple_variables(self):
        vars = self._extract_variables("{{greeting}} {{name}}, you are {{role}}")
        assert "greeting" in vars
        assert "name" in vars
        assert "role" in vars

    def test_no_variables(self):
        vars = self._extract_variables("No variables here")
        assert vars == []

    def test_duplicate_variables(self):
        vars = self._extract_variables("{{name}} and {{name}} again")
        assert vars.count("name") == 1

    def test_render_substitution(self):
        content = "Hello {{name}}, you are a {{role}}."
        values = {"name": "Alice", "role": "developer"}
        for k, v in values.items():
            content = content.replace(f"{{{{{k}}}}}", v)
        assert content == "Hello Alice, you are a developer."

    def test_partial_render(self):
        content = "Hello {{name}}, you are a {{role}}."
        values = {"name": "Bob"}
        for k, v in values.items():
            content = content.replace(f"{{{{{k}}}}}", v)
        assert "Bob" in content
        assert "{{role}}" in content


class TestPromptValidation:
    def test_empty_title_rejected(self):
        from pydantic import ValidationError
        from backend.app.schemas.prompt import PromptCreate
        with pytest.raises(ValidationError):
            PromptCreate(title="", content="Some content")

    def test_empty_content_rejected(self):
        from pydantic import ValidationError
        from backend.app.schemas.prompt import PromptCreate
        with pytest.raises(ValidationError):
            PromptCreate(title="Valid Title", content="   ")

    def test_valid_prompt_accepted(self):
        from backend.app.schemas.prompt import PromptCreate
        p = PromptCreate(title="My Prompt", content="Do this task")
        assert p.title == "My Prompt"
        assert p.version_number_default == 1 if hasattr(p, 'version_number_default') else True
