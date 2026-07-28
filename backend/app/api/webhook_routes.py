import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class WebhookRequest(BaseModel):
    webhook_url: str
    lead_id: str

@router.post("/export/webhook")
async def push_to_webhook(request: WebhookRequest):
    # Logic to fetch lead data from DB and push to the provided URL
    try:
        # Placeholder: fetch data from DB
        lead_data = {"id": request.lead_id, "name": "PT ABC", "status": "READY"}

        # Push to webhook
        response = requests.post(request.webhook_url, json=lead_data)

        if response.status_code == 200:
            return {"status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to push to webhook")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
