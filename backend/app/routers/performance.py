"""
Performance Analytics Router - Aggregates test scores and history for the Analytics tab.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.test_result import TestResult
from app.utils.security import get_current_user

router = APIRouter(prefix="/performance", tags=["Performance Analytics"])

@router.get("/metrics")
async def get_performance_metrics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns aggregated metrics for the Performance UI Dashboard.
    Includes time series data and accuracy by topic/question type.
    """
    query = select(TestResult).where(TestResult.user_id == current_user.id).order_by(TestResult.created_at)
    result = await db.execute(query)
    tests = result.scalars().all()

    if not tests:
        return {
            "summary": {
                "tests_taken": 0,
                "average_score": 0,
            },
            "recent_tests": [],
            "topic_performance": {}
        }

    total_tests = len(tests)
    sum_percentage = sum(t.percentage for t in tests)
    avg_score = sum_percentage / total_tests

    # Time series (for charts)
    recent_tests = []
    topic_map = {}
    
    for t in tests:
        recent_tests.append({
            "id": t.id,
            "topic_name": t.topic_name,
            "percentage": t.percentage,
            "created_at": t.created_at.isoformat()
        })
        
        # Topic aggregations
        if t.topic_name not in topic_map:
            topic_map[t.topic_name] = {"sum": 0, "count": 0, "latest_score": 0}
        topic_map[t.topic_name]["sum"] += t.percentage
        topic_map[t.topic_name]["count"] += 1
        topic_map[t.topic_name]["latest_score"] = t.percentage  # tests are ordered by created_at ascending, so last one is latest

    topic_performance = {}
    for topic, stats in topic_map.items():
        topic_performance[topic] = {
            "attempts": stats["count"],
            "avg_score": round(stats["sum"] / stats["count"], 1),
            "latest_score": round(stats["latest_score"], 1)
        }

    return {
        "summary": {
            "tests_taken": total_tests,
            "average_score": round(avg_score, 1)
        },
        "recent_tests": recent_tests,
        "topic_performance": topic_performance
    }
