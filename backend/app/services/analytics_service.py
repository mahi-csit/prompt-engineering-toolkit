"""
Analytics service using Motor aggregation pipeline (MongoDB).
Fixed for Beanie 2.x — aggregate() returns a cursor, not a coroutine.
"""
from datetime import datetime, timedelta
from ..models.prompt import Prompt, Evaluation
from ..models.user import User


async def _run_aggregate(document_class, pipeline: list) -> list:
    """
    Helper that works with both Beanie 1.x and 2.x aggregate API.
    Beanie 2.x aggregate() returns an AsyncIOMotorLatentCommandCursor
    which must be iterated, not awaited directly.
    """
    results = []
    cursor = document_class.get_pymongo_collection().aggregate(pipeline)
    async for doc in cursor:
        results.append(doc)
    return results


class AnalyticsService:

    @staticmethod
    async def get_dashboard_stats() -> dict:
        # Simple counts
        total_prompts = await Prompt.count()
        total_users = await User.count()
        total_evals = await Evaluation.count()
        favorite_prompts = await Prompt.find(Prompt.is_favorite == True).count()  # noqa: E712

        # Active prompts in last 30 days
        cutoff = datetime.utcnow() - timedelta(days=30)
        active_prompts = await Prompt.find(Prompt.updated_at >= cutoff).count()

        # Category distribution
        cat_pipeline = [
            {"$match": {"category": {"$ne": None}}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        cat_results = await _run_aggregate(Prompt, cat_pipeline)
        categories = [{"category": r["_id"], "count": r["count"]} for r in cat_results]

        # Average evaluation score
        avg_pipeline = [
            {"$match": {"overall_score": {"$ne": None}}},
            {"$group": {"_id": None, "avg": {"$avg": "$overall_score"}}},
        ]
        avg_results = await _run_aggregate(Evaluation, avg_pipeline)
        avg_score = avg_results[0]["avg"] if avg_results else 0.0

        # Score distribution buckets
        distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
        all_evals = await Evaluation.find(
            {"overall_score": {"$ne": None}}
        ).to_list()
        for ev in all_evals:
            s = ev.overall_score or 0
            if s <= 20:
                distribution["0-20"] += 1
            elif s <= 40:
                distribution["21-40"] += 1
            elif s <= 60:
                distribution["41-60"] += 1
            elif s <= 80:
                distribution["61-80"] += 1
            else:
                distribution["81-100"] += 1

        # Top performing prompts
        top_pipeline = [
            {"$match": {"overall_score": {"$ne": None}}},
            {"$group": {
                "_id": "$prompt_id",
                "average_score": {"$avg": "$overall_score"},
            }},
            {"$sort": {"average_score": -1}},
            {"$limit": 5},
        ]
        top_results = await _run_aggregate(Evaluation, top_pipeline)
        top_prompts = []
        for r in top_results:
            p = await Prompt.get(r["_id"])
            top_prompts.append({
                "prompt_name": p.title if p else str(r["_id"]),
                "average_score": round(float(r["average_score"]), 1),
            })

        return {
            "total_prompts": total_prompts,
            "total_users": total_users,
            "total_evaluations": total_evals,
            "active_prompts_last_30_days": active_prompts,
            "favorite_prompts": favorite_prompts,
            "categories": categories,
            "evaluation_stats": {
                "total_evaluations": total_evals,
                "average_score": round(float(avg_score), 1),
                "score_distribution": distribution,
                "top_performing_prompts": top_prompts,
            },
            "optimization_stats": {
                "total_optimizations": 0,
                "average_confidence": 0.0,
            },
        }

    @staticmethod
    async def get_prompt_usage_stats(limit: int = 10) -> list:
        pipeline = [
            {"$group": {
                "_id": "$prompt_id",
                "evaluation_count": {"$sum": 1},
                "average_score": {"$avg": "$overall_score"},
            }},
            {"$sort": {"evaluation_count": -1}},
            {"$limit": limit},
        ]
        results = await _run_aggregate(Evaluation, pipeline)
        stats = []
        for r in results:
            p = await Prompt.get(r["_id"])
            stats.append({
                "prompt_id": str(r["_id"]),
                "prompt_title": p.title if p else str(r["_id"]),
                "evaluation_count": r["evaluation_count"],
                "average_score": round(float(r["average_score"]), 1) if r.get("average_score") else None,
            })
        return stats
