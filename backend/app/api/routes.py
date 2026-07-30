from fastapi import APIRouter
from pydantic import BaseModel
from app.services.queue.celery_app import celery_app
from celery.result import AsyncResult
from app.core.db import get_all_leads
from app.core.cache import get_cached_search, set_cached_search


router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    limit: int = 100

@router.post("/search")
async def start_search(request: SearchRequest):
    # 0. Check Redis / Memory Cache First for Instant Response
    cached_data = get_cached_search(request.query, request.limit)
    if cached_data:
        return {
            "job_id": f"cached-{hash(request.query)}",
            "status": "COMPLETED",
            "cached": True,
            "result": cached_data,
            "message": "Returned instant 24h cached results (Redis Cache Hit)"
        }

    # Trigger Celery / Background Job asynchronously to prevent Serverless HTTP timeout
    task = celery_app.send_task(
        "app.services.scrapers.tasks.run_search",
        args=[request.query, request.limit]
    )
    return {
        "job_id": task.id,
        "status": "PENDING",
        "cached": False,
        "message": "Background scraping task initiated"
    }

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id.startswith("cached-"):
        return {
            "job_id": job_id,
            "status": "SUCCESS",
            "progress": 100,
            "message": "Instant Redis Cache Hit"
        }

    task_result = AsyncResult(job_id, app=celery_app)
    return {
        "job_id": job_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

@router.get("/leads")
async def get_leads():
    leads = get_all_leads()
    return leads
