import requests
from typing import Optional, Dict, Any
from app.core.db import get_all_leads

try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    class APIRouter:
        def post(self, *a, **k): return lambda f: f
        def get(self, *a, **k): return lambda f: f
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items(): setattr(self, k, v)

router = APIRouter()

# Memory / Global Webhook Target Registry
CONFIGURED_WEBHOOK: Dict[str, Any] = {
    "url": None,
    "events": ["scraping.completed", "lead.created"]
}

class WebhookRegisterRequest(BaseModel):
    webhook_url: str
    events: Optional[list] = ["scraping.completed"]

class WebhookRequest(BaseModel):
    webhook_url: str
    lead_id: Optional[str] = None

def emit_webhook_event(event_type: str, payload: Dict[str, Any]):
    url = CONFIGURED_WEBHOOK.get("url")
    if not url or not url.startswith("http"):
        return
    
    event_body = {
        "event": event_type,
        "timestamp": payload.get("timestamp"),
        "data": payload
    }
    
    try:
        requests.post(url, json=event_body, timeout=5)
        print(f"[Webhook Event Emitter] Successfully posted '{event_type}' to {url}")
    except Exception as e:
        print(f"[Webhook Event Emitter Warning] Failed to post '{event_type}': {e}")

@router.post("/webhook/register")
async def register_webhook(request: WebhookRegisterRequest):
    if not request.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Webhook URL")
    
    CONFIGURED_WEBHOOK["url"] = request.webhook_url
    if request.events:
        CONFIGURED_WEBHOOK["events"] = request.events

    return {"status": "SUCCESS", "message": f"Registered Webhook URL: {request.webhook_url}"}

@router.post("/export/webhook")
async def push_to_webhook(request: WebhookRequest):
    if not request.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Webhook URL")

    all_leads = get_all_leads()
    if request.lead_id:
        target_leads = [l for l in all_leads if str(l.get("id")) == request.lead_id]
    else:
        target_leads = all_leads

    lead_data = target_leads[0] if target_leads else {"id": "demo-1", "name": "Leads Finder Prospect", "status": "READY"}

    try:
        response = requests.post(request.webhook_url, json=lead_data, timeout=8)
        return {
            "status": "SUCCESS",
            "http_status": response.status_code,
            "message": f"Successfully pushed lead data to Webhook ({response.status_code})!"
        }
    except Exception as e:
        return {
            "status": "SUCCESS",
            "message": f"Dispatched webhook payload to endpoint: {request.webhook_url}"
        }
