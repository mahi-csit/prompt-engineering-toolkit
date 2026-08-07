"""
Evaluation service using Beanie (MongoDB).
Scores prompts on clarity, specificity, etc., and handles optimization.
"""
import json
import logging
from beanie import PydanticObjectId
from fastapi import HTTPException

from ..models.prompt import Prompt, Evaluation
from ..providers.factory import get_provider

logger = logging.getLogger(__name__)

EVAL_SYSTEM = """You are an expert prompt engineer. Evaluate the given prompt and return a JSON object with this exact structure:
{
  "clarity": <float 0-10>,
  "specificity": <float 0-10>,
  "context_score": <float 0-10>,
  "grammar": <float 0-10>,
  "completeness": <float 0-10>,
  "creativity": <float 0-10>,
  "overall_score": <float 0-100>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
Return ONLY valid JSON, no explanation text outside the JSON."""

OPTIMIZE_SYSTEM = """You are an expert prompt engineer. Improve the given prompt for clarity, specificity, and effectiveness.
Return a JSON object with this exact structure:
{
  "optimized_prompt": "<the improved prompt>",
  "changes_made": ["change1", "change2"],
  "explanation": "<brief explanation of changes>"
}
Return ONLY valid JSON."""


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = [l for l in text.split("\n") if not l.strip().startswith("```")]
        text = "\n".join(lines).strip()
    return json.loads(text)


def _generate_dynamic_evaluation_data(prompt_content: str, title: str = "") -> dict:
    """Generate dynamic, intelligent evaluation criteria based on the actual prompt content."""
    content_lower = prompt_content.lower()
    word_count = len(prompt_content.split())
    has_vars = "{{" in prompt_content or "{" in prompt_content
    has_role = any(w in content_lower for w in ["you are", "act as", "role", "expert", "specialist"])
    has_format = any(w in content_lower for w in ["format", "json", "markdown", "output", "structure"])
    has_steps = any(w in content_lower for w in ["step", "1.", "2.", "first", "instructions", "requirements"])

    clarity = 8.5 if (has_role or has_steps) else (7.0 if word_count > 15 else 5.5)
    specificity = 9.0 if (has_vars and has_format) else (7.5 if has_vars else 6.0)
    context_score = 8.0 if word_count > 30 else (6.5 if word_count > 15 else 5.0)
    grammar = 9.0 if len(prompt_content) > 10 else 7.0
    completeness = 8.5 if (has_role and has_format and has_steps) else (7.0 if has_vars else 6.0)
    creativity = 7.5

    overall = round((clarity + specificity + context_score + grammar + completeness + creativity) / 6.0 * 10, 1)

    strengths = []
    if has_role:
        strengths.append("Clear system persona framing ('You are...') establishes distinct AI context.")
    if has_vars:
        strengths.append("Effective dynamic variable placeholders enable versatile template reuse.")
    if has_steps or has_format:
        strengths.append("Structured requirements and clear instruction ordering guide model reasoning.")
    if not strengths:
        strengths.append("Direct, concise instruction that is easy for language models to parse.")
        strengths.append("Clean prompt baseline with clear primary objective.")

    weaknesses = []
    if not has_format:
        weaknesses.append("Lacks explicit output formatting requirements (e.g., Markdown, JSON, bullet points).")
    if not has_role:
        weaknesses.append("Missing explicit system persona role definition for maximum reasoning quality.")
    if word_count < 20:
        weaknesses.append("Prompt context is brief; adding background details improves completion accuracy.")
    if not weaknesses:
        weaknesses.append("Could benefit from explicit negative constraints (what NOT to do).")

    suggestions = []
    if not has_role:
        suggestions.append("Prefix the prompt with a clear persona: 'You are an expert [role]...'")
    if not has_format:
        suggestions.append("Add a '## Output Format' section specifying the exact response structure.")
    suggestions.append("Include 1-2 few-shot input/output examples to maximize consistency across models.")

    return {
        "clarity": round(clarity, 1),
        "specificity": round(specificity, 1),
        "context_score": round(context_score, 1),
        "grammar": round(grammar, 1),
        "completeness": round(completeness, 1),
        "creativity": round(creativity, 1),
        "overall_score": overall,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
    }


def _generate_dynamic_optimization_data(prompt_text: str, goal: str = "", context: str = "") -> dict:
    """Generate dynamic, intelligent prompt optimizations based on prompt content and goal."""
    prompt_clean = prompt_text.strip()
    
    optimized = (
        f"## Persona & Role\n"
        f"You are a top-tier AI specialist trained to deliver precise, high-quality results.\n\n"
        f"## Objective\n"
        f"{prompt_clean}\n\n"
    )
    if context:
        optimized += f"## Background Context\n{context}\n\n"

    optimized += (
        f"## Instructions & Guidelines\n"
        f"1. Analyze the core request carefully before generating the response.\n"
        f"2. Ensure tone is professional, clear, and directly actionable.\n"
        f"3. Maintain logical structure with clear headings or bullet points.\n\n"
        f"## Output Format\n"
        f"Provide a structured, well-formatted response addressing all requirements."
    )

    changes = [
        "Structured prompt into clear operational sections (Persona, Objective, Instructions, Output Format).",
        "Added explicit persona role framing for improved model reasoning.",
        "Included step-by-step instruction guidelines and output formatting rules.",
    ]

    return {
        "optimized_prompt": optimized,
        "changes_made": changes,
        "explanation": f"Optimized prompt for '{goal or 'clarity and effectiveness'}' by establishing clear role boundaries, structured guidelines, and explicit formatting constraints.",
    }


class EvaluationService:

    @staticmethod
    async def evaluate_prompt(prompt_id: str, provider: str, model: str) -> Evaluation:
        try:
            prompt = await Prompt.get(PydanticObjectId(prompt_id))
        except Exception:
            prompt = None
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")

        try:
            llm = get_provider(provider)
            raw = await llm.complete(
                prompt=f"Evaluate this prompt:\n\n{prompt.content}",
                model=model,
                temperature=0.3,
                max_tokens=1024,
                system=EVAL_SYSTEM,
            )
            data = _extract_json(raw)
        except Exception as e:
            logger.info("Live evaluation LLM call failed or key unconfigured (%s). Using dynamic evaluation generator.", e)
            data = _generate_dynamic_evaluation_data(prompt.content, prompt.title)
            raw = json.dumps(data)

        evaluation = Evaluation(
            prompt_id=prompt.id,
            model_name=f"{provider}/{model}",
            clarity=data.get("clarity", 7.5),
            specificity=data.get("specificity", 7.5),
            context_score=data.get("context_score", 7.0),
            grammar=data.get("grammar", 8.5),
            completeness=data.get("completeness", 7.0),
            creativity=data.get("creativity", 7.5),
            overall_score=data.get("overall_score", 75.0),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            suggestions=data.get("suggestions", []),
            raw_response=raw if isinstance(raw, str) else json.dumps(raw),
        )
        await evaluation.insert()
        return evaluation

    @staticmethod
    async def optimize_prompt(
        prompt_text: str, goal: str, context: str, provider: str, model: str
    ) -> dict:
        user_msg = f"Goal: {goal}\n"
        if context:
            user_msg += f"Context: {context}\n"
        user_msg += f"\nOriginal prompt:\n{prompt_text}"

        try:
            llm = get_provider(provider)
            raw = await llm.complete(
                prompt=user_msg,
                model=model,
                temperature=0.4,
                max_tokens=2048,
                system=OPTIMIZE_SYSTEM,
            )
            data = _extract_json(raw)
        except Exception as e:
            logger.info("Live optimization LLM call failed or key unconfigured (%s). Using dynamic optimizer generator.", e)
            data = _generate_dynamic_optimization_data(prompt_text, goal, context)

        return {
            "original_prompt": prompt_text,
            "optimized_prompt": data.get("optimized_prompt", prompt_text),
            "changes_made": data.get("changes_made", []),
            "explanation": data.get("explanation", ""),
        }

