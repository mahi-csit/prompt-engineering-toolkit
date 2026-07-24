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
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except json.JSONDecodeError:
            logger.warning("Could not parse evaluation JSON: %s", raw[:200])
            data = {
                "clarity": 5.0, "specificity": 5.0, "context_score": 5.0,
                "grammar": 5.0, "completeness": 5.0, "creativity": 5.0,
                "overall_score": 50.0,
                "strengths": ["Unable to parse detailed evaluation"],
                "weaknesses": ["Response format unexpected"],
                "suggestions": ["Try again or check model availability"],
            }

        evaluation = Evaluation(
            prompt_id=prompt.id,
            model_name=f"{provider}/{model}",
            clarity=data.get("clarity", 5.0),
            specificity=data.get("specificity", 5.0),
            context_score=data.get("context_score", 5.0),
            grammar=data.get("grammar", 5.0),
            completeness=data.get("completeness", 5.0),
            creativity=data.get("creativity", 5.0),
            overall_score=data.get("overall_score", 50.0),
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
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except json.JSONDecodeError:
            logger.warning("Could not parse optimization JSON")
            data = {
                "optimized_prompt": prompt_text,
                "changes_made": ["Could not parse LLM response"],
                "explanation": "The LLM returned an unexpected format.",
            }

        return {
            "original_prompt": prompt_text,
            "optimized_prompt": data.get("optimized_prompt", prompt_text),
            "changes_made": data.get("changes_made", []),
            "explanation": data.get("explanation", ""),
        }
