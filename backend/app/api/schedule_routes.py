import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# In-memory storage for scheduled jobs
SCHEDULED_JOBS = {}

class ScheduleRequest(BaseModel):
    query: str
    frequency: str = "daily"  # "daily", "weekly", "monthly"
    limit: int = 15
    notification_email: Optional[str] = None

class ScheduleResponse(BaseModel):
    schedule_id: str
    query: str
    frequency: str
    limit: int
    status: str
    next_run: str

@router.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest):
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
        "next_run": "Tomorrow at 08:00 WIB" if request.frequency == "daily" else "Next Monday at 08:00 WIB"
    }

    SCHEDULED_JOBS[schedule_id] = job_entry
    return job_entry

@router.get("/schedules")
async def list_schedules():
    return list(SCHEDULED_JOBS.values())

@router.delete("/schedule/{schedule_id}")
async def delete_schedule(schedule_id: str):
    if schedule_id not in SCHEDULED_JOBS:
        raise HTTPException(status_code=404, detail="Schedule not found")
    del SCHEDULED_JOBS[schedule_id]
    return {"message": f"Schedule {schedule_id} successfully deleted"}
