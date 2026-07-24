"""
Pydantic schemas for Analytics Dashboard.
"""
from typing import List, Dict, Optional
from pydantic import BaseModel


class CategoryStat(BaseModel):
    category: str
    count: int


class EvalStats(BaseModel):
    total_evaluations: int
    average_score: float
    score_distribution: Dict[str, int]
    top_performing_prompts: List[Dict]


class OptimizationStats(BaseModel):
    total_optimizations: int
    average_confidence: float


class DashboardStats(BaseModel):
    total_prompts: int
    total_users: int
    total_evaluations: int
    active_prompts_last_30_days: int
    favorite_prompts: int
    categories: List[CategoryStat]
    evaluation_stats: EvalStats
    optimization_stats: OptimizationStats


class PromptUsageStat(BaseModel):
    prompt_id: int
    prompt_title: str
    evaluation_count: int
    average_score: Optional[float] = None
