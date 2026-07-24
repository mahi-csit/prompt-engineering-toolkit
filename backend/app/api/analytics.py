"""
Analytics routes — no database session, Beanie used directly in service.
"""
from fastapi import APIRouter, Query
from ..services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats():
    return await AnalyticsService.get_dashboard_stats()


@router.get("/prompt-usage")
async def get_prompt_usage(limit: int = Query(10, ge=1, le=50)):
    return await AnalyticsService.get_prompt_usage_stats(limit=limit)
