from fastapi import APIRouter
from pydantic import BaseModel
from app.services.queue.celery_app import celery_app
from celery.result import AsyncResult
from app.core.db import get_all_leads


router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    limit: int = 100

@router.post("/search")
async def start_search(request: SearchRequest):
    # Trigger Celery task asynchronously
    task = celery_app.send_task(
        "app.services.scrapers.tasks.run_search",
        args=[request.query, request.limit]
    )
    return {"job_id": task.id, "message": "Search initiated"}

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    task_result = AsyncResult(job_id, app=celery_app)
    return {
        "job_id": job_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

@router.get("/leads")
async def get_leads():
    # Fetch leads from database / fallback store
    leads = get_all_leads()
    return leads

