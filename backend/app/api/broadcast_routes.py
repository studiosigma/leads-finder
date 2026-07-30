try:
    from fastapi import APIRouter, HTTPException, BackgroundTasks
except ImportError:
    class APIRouter:
        def post(self, *a, **k): return lambda f: f
        def get(self, *a, **k): return lambda f: f
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
            for k, v in kwargs.items(): setattr(self, k, v)
        def dict(self, *a, **k): return self.__dict__

from typing import List, Optional, Dict, Any
from app.services.broadcast_service import BroadcastService
from app.core.db import get_all_leads

router = APIRouter()
broadcast_service = BroadcastService()

class BroadcastRequest(BaseModel):
    channel: str = "whatsapp"  # "whatsapp" or "email"
    message_template: str
    delay_seconds: int = 5
    lead_ids: Optional[List[str]] = None
    wa_gateway_token: Optional[str] = None

@router.post("/broadcast/send")
async def send_broadcast_campaign(request: BroadcastRequest):
    if not request.message_template.strip():
        raise HTTPException(status_code=400, detail="Message template is required")

    all_leads = get_all_leads()
    if request.lead_ids:
        target_leads = [l for l in all_leads if str(l.get("id")) in request.lead_ids]
    else:
        target_leads = all_leads

    if not target_leads:
        raise HTTPException(status_code=404, detail="No target leads found in database for broadcast campaign")

    result = broadcast_service.send_broadcast(
        leads=target_leads,
        channel=request.channel.lower(),
        message_template=request.message_template,
        delay_seconds=request.delay_seconds,
        wa_gateway_token=request.wa_gateway_token
    )

    return result
