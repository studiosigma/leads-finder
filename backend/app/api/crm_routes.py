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
        raise HTTPException(status_code=404, detail="No leads found to export")

    success_count = 0
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
                "status": lead.get("status")
            }
            res = requests.post(request.webhook_url, json=payload, timeout=5)
            if res.status_code in [200, 201]:
                success_count += 1
        except Exception:
            pass

    return {
        "status": "SUCCESS",
        "exported_count": success_count,
        "total_requested": len(target_leads),
        "message": f"Successfully synced {success_count}/{len(target_leads)} leads to Google Sheets."
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
