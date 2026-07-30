import uuid
import asyncio
import time
from datetime import datetime, timezone
try:
    from fastapi import APIRouter, HTTPException, BackgroundTasks
except ImportError:
    class APIRouter:
        def post(self, *a, **k): return lambda f: f
        def get(self, *a, **k): return lambda f: f
        def delete(self, *a, **k): return lambda f: f
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail
    class BackgroundTasks:
        def add_task(self, func, *args, **kwargs): func(*args, **kwargs)
try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self, *a, **k):
            return self.__dict__
from typing import List, Optional, Dict, Any
from app.services.scrapers.tasks import run_search

router = APIRouter()

# In-memory storage for scheduled jobs
SCHEDULED_JOBS: Dict[str, Dict[str, Any]] = {}

class ScheduleRequest(BaseModel):
    query: str
    frequency: str = "daily"  # "hourly", "daily", "weekly"
    limit: int = 15
    notification_email: Optional[str] = None

class ScheduleResponse(BaseModel):
    schedule_id: str
    query: str
    frequency: str
    limit: int
    status: str
    next_run: str
    last_run: Optional[str] = None
    runs_count: int = 0

def calculate_next_run(frequency: str) -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    if frequency == "hourly":
        return f"In 1 hour ({now_str})"
    elif frequency == "weekly":
        return f"Next week ({now_str})"
    return f"Tomorrow at 08:00 WIB ({now_str})"

@router.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest, background_tasks: BackgroundTasks):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    schedule_id = f"sched_{uuid.uuid4().hex[:8]}"
    job_entry = {
        "schedule_id": schedule_id,
        "query": request.query.strip(),
        "frequency": request.frequency,
        "limit": request.limit,
        "notification_email": request.notification_email,
        "status": "ACTIVE",
        "next_run": calculate_next_run(request.frequency),
        "last_run": None,
        "runs_count": 0,
        "created_timestamp": time.time()
    }

    SCHEDULED_JOBS[schedule_id] = job_entry
    
    # Optionally trigger initial run in background
    background_tasks.add_task(execute_job_task, schedule_id)

    return job_entry

def execute_job_task(schedule_id: str):
    job = SCHEDULED_JOBS.get(schedule_id)
    if not job:
        return
    
    try:
        print(f"[Scheduler Engine] Executing scheduled scraping job: {job['query']} (Limit: {job['limit']})")
        # Run search task pipeline synchronously or via Celery
        run_search(job['query'], limit=job['limit'])
        job["last_run"] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        job["runs_count"] += 1
        job["next_run"] = calculate_next_run(job["frequency"])
    except Exception as e:
        print(f"[Scheduler Engine Error] Failed job {schedule_id}: {e}")

@router.post("/schedule/{schedule_id}/run")
async def run_schedule_manually(schedule_id: str, background_tasks: BackgroundTasks):
    if schedule_id not in SCHEDULED_JOBS:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    background_tasks.add_task(execute_job_task, schedule_id)
    return {"status": "SUCCESS", "message": f"Triggered manual execution for schedule '{schedule_id}'"}

@router.get("/schedules")
async def list_schedules():
    return list(SCHEDULED_JOBS.values())

@router.delete("/schedule/{schedule_id}")
async def delete_schedule(schedule_id: str):
    if schedule_id not in SCHEDULED_JOBS:
        raise HTTPException(status_code=404, detail="Schedule not found")
    del SCHEDULED_JOBS[schedule_id]
    return {"message": f"Schedule {schedule_id} successfully deleted"}
