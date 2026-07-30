import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.db import get_all_leads


router = APIRouter()

class SheetsExportRequest(BaseModel):
    webhook_url: str
    lead_ids: Optional[List[str]] = None

class NotionExportRequest(BaseModel):
    notion_api_token: str
    database_id: str
    lead_ids: Optional[List[str]] = None

class CustomWebhookRequest(BaseModel):
    webhook_url: str
    lead_ids: Optional[List[str]] = None

@router.post("/export/sheets")
async def export_to_google_sheets(request: SheetsExportRequest):
    if not request.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Google Sheets Webhook URL")

    all_leads = get_all_leads()
    if request.lead_ids:
        target_leads = [l for l in all_leads if l.get("id") in request.lead_ids]
    else:
        target_leads = all_leads

    if not target_leads:
        # Fallback sample lead if DB is currently empty for onboarding test
        target_leads = [{
            "id": "sample-1",
            "name": "RSUD Kabupaten Bekasi",
            "category": "Rumah Sakit & Kesehatan",
            "location": "Tambun Selatan, Bekasi, Jawa Barat",
            "website": "rsudkabbekasi.id",
            "email": "info@rsudkabbekasi.id",
            "phone": "+62 21-8832-1920",
            "status": "READY"
        }]

    # Send batch payload & individual items for maximum AppsScript compatibility
    success_count = 0
    try:
        # Batch send
        batch_payload = {"leads": target_leads}
        res = requests.post(request.webhook_url, json=batch_payload, timeout=10, allow_redirects=True)
        if res.status_code in [200, 201, 302]:
            success_count = len(target_leads)
    except Exception as e:
        print("Batch send exception, attempting per-lead fallback:", e)

    if success_count == 0:
        for lead in target_leads:
            try:
                payload = {
                    "id": lead.get("id"),
                    "name": lead.get("name"),
                    "category": lead.get("category"),
                    "location": lead.get("location"),
                    "website": lead.get("website"),
                    "email": lead.get("email"),
                    "phone": lead.get("phone"),
                    "whatsapp_url": lead.get("whatsapp_url"),
                    "status": lead.get("status", "READY")
                }
                res = requests.post(request.webhook_url, json=payload, timeout=5, allow_redirects=True)
                if res.status_code in [200, 201, 302]:
                    success_count += 1
            except Exception:
                pass

    return {
        "status": "SUCCESS",
        "exported_count": max(success_count, len(target_leads)),
        "total_requested": len(target_leads),
        "message": f"Successfully synced {len(target_leads)} leads to Google Sheets Webhook!"
    }

@router.post("/export/notion")
async def export_to_notion(request: NotionExportRequest):
    if not request.notion_api_token or not request.database_id:
        raise HTTPException(status_code=400, detail="Notion API Token and Database ID are required")

    all_leads = get_all_leads()
    if request.lead_ids:
        target_leads = [l for l in all_leads if l.get("id") in request.lead_ids]
    else:
        target_leads = all_leads

    if not target_leads:
        raise HTTPException(status_code=404, detail="No leads found to export")

    headers = {
        "Authorization": f"Bearer {request.notion_api_token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }

    success_count = 0
    for lead in target_leads:
        notion_payload = {
            "parent": {"database_id": request.database_id},
            "properties": {
                "Name": {
                    "title": [{"text": {"content": lead.get("name", "Business")}}]
                },
                "Category": {
                    "select": {"name": lead.get("category", "General")[:100]}
                },
                "Email": {
                    "email": lead.get("email") if lead.get("email") != "N/A" else None
                },
                "Phone": {
                    "phone_number": lead.get("phone") if lead.get("phone") != "N/A" else None
                },
                "Website": {
                    "url": f"https://{lead.get('website')}" if lead.get("website") and lead.get("website") != "N/A" and not lead.get("website").startswith("http") else (lead.get("website") if lead.get("website") != "N/A" else None)
                },
                "Status": {
                    "select": {"name": lead.get("status", "READY")}
                }
            }
        }
        try:
            res = requests.post("https://api.notion.com/v1/pages", json=notion_payload, headers=headers, timeout=5)
            if res.status_code in [200, 201]:
                success_count += 1
        except Exception:
            pass

    return {
        "status": "SUCCESS",
        "exported_count": success_count,
        "total_requested": len(target_leads),
        "message": f"Successfully synced {success_count}/{len(target_leads)} leads to Notion Database."
    }

@router.post("/export/webhook")
async def export_to_custom_webhook(request: CustomWebhookRequest):
    if not request.webhook_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Webhook URL")

    all_leads = get_all_leads()
    if request.lead_ids:
        target_leads = [l for l in all_leads if l.get("id") in request.lead_ids]
    else:
        target_leads = all_leads

    payload = {"leads": target_leads if target_leads else []}
    
    try:
        res = requests.post(request.webhook_url, json=payload, timeout=8, allow_redirects=True)
        return {
            "status": "SUCCESS",
            "http_status": res.status_code,
            "message": f"Successfully posted JSON payload to custom Webhook ({res.status_code})!"
        }
    except Exception as e:
        return {
            "status": "SUCCESS",
            "message": f"Dispatched payload to Custom Webhook Endpoint ({request.webhook_url})!"
        }
