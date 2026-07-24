"""
Evaluation routes: evaluate prompts, optimize prompts.
Uses Beanie directly — no SQLAlchemy session.
"""
from fastapi import APIRouter, HTTPException

from ..schemas.evaluation import (
    EvaluationRequest, EvaluationResponse,
    OptimizeRequest, OptimizeResponse,
)
from ..services.evaluation_service import EvaluationService

router = APIRouter()

DEFAULT_RUBRICS = [
    {
        "name": "General Quality",
        "description": "Evaluates overall prompt quality: clarity, specificity, context, grammar, completeness, creativity.",
        "criteria": ["clarity", "specificity", "context", "grammar", "completeness", "creativity"],
    },
    {
        "name": "Technical Accuracy",
        "description": "Evaluates how well a prompt requests technically accurate and precise output.",
        "criteria": ["specificity", "completeness", "clarity", "context"],
    },
    {
        "name": "Creative Writing",
        "description": "Evaluates prompt effectiveness for creative writing tasks.",
        "criteria": ["creativity", "clarity", "context", "grammar"],
    },
    {
        "name": "Instruction Following",
        "description": "Evaluates how well the prompt will guide a model to follow instructions.",
        "criteria": ["clarity", "specificity", "completeness", "grammar"],
    },
]


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_prompt(data: EvaluationRequest):
    evaluation = await EvaluationService.evaluate_prompt(
        str(data.prompt_id), data.provider, data.model
    )
    return EvaluationResponse(
        id=str(evaluation.id),
        prompt_id=str(evaluation.prompt_id),
        model_name=evaluation.model_name,
        clarity=evaluation.clarity,
        specificity=evaluation.specificity,
        context_score=evaluation.context_score,
        grammar=evaluation.grammar,
        completeness=evaluation.completeness,
        creativity=evaluation.creativity,
        overall_score=evaluation.overall_score,
        strengths=evaluation.strengths,
        weaknesses=evaluation.weaknesses,
        suggestions=evaluation.suggestions,
        created_at=evaluation.created_at,
    )


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_prompt(data: OptimizeRequest):
    result = await EvaluationService.optimize_prompt(
        prompt_text=data.prompt,
        goal=data.goal or "improve clarity and effectiveness",
        context=data.context or "",
        provider=data.provider,
        model=data.model,
    )
    return OptimizeResponse(**result)


@router.get("/rubrics/default")
async def get_default_rubrics():
    return {"rubrics": DEFAULT_RUBRICS}


@router.get("/rubrics/default/{rubric_name}")
async def get_default_rubric(rubric_name: str):
    for rubric in DEFAULT_RUBRICS:
        if rubric["name"].lower() == rubric_name.lower():
            return rubric
    raise HTTPException(status_code=404, detail="Rubric not found")
