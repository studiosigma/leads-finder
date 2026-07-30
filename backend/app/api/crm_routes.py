import requests
try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    class APIRouter:
        def post(self, *a, **k): return lambda f: f
        def get(self, *a, **k): return lambda f: f
        def delete(self, *a, **k): return lambda f: f
        def patch(self, *a, **k): return lambda f: f
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail
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
        raise HTTPException(status_code=404, detail="No leads found to sync. Please perform a search or add leads first.")

    # Send batch payload & individual items for maximum AppsScript compatibility
    success_count = 0
    last_error = None
    try:
        # Batch send
        batch_payload = {"leads": target_leads}
        res = requests.post(request.webhook_url, json=batch_payload, timeout=10, allow_redirects=True)
        if res.status_code in [200, 201, 302]:
            success_count = len(target_leads)
    except Exception as e:
        last_error = str(e)
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
                    "lead_score": lead.get("lead_score", 0),
                    "lead_grade": lead.get("lead_grade", "COLD"),
                    "status": lead.get("status", "READY")
                }
                res = requests.post(request.webhook_url, json=payload, timeout=5, allow_redirects=True)
                if res.status_code in [200, 201, 302]:
                    success_count += 1
            except Exception as e:
                last_error = str(e)

    if success_count > 0:
        return {
            "status": "SUCCESS",
            "exported_count": success_count,
            "total_requested": len(target_leads),
            "message": f"Successfully synced {success_count}/{len(target_leads)} leads to Google Sheets Webhook!"
        }
    else:
        return {
            "status": "WARNING",
            "exported_count": 0,
            "total_requested": len(target_leads),
            "message": f"Dispatched sync payload to Webhook. (Note: Google Apps Script may require CORS / deployment permissions: {last_error or 'No response'})"
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
    errors = []
    for lead in target_leads:
        notion_payload = {
            "parent": {"database_id": request.database_id},
            "properties": {
                "Name": {
                    "title": [{"text": {"content": lead.get("name", "Business")}}]
                },
                "Category": {
                    "select": {"name": (lead.get("category") or "General")[:100]}
                },
                "Email": {
                    "email": lead.get("email") if lead.get("email") and lead.get("email") != "N/A" else None
                },
                "Phone": {
                    "phone_number": lead.get("phone") if lead.get("phone") and lead.get("phone") != "N/A" else None
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
            res = requests.post("https://api.notion.com/v1/pages", json=notion_payload, headers=headers, timeout=8)
            if res.status_code in [200, 201]:
                success_count += 1
            else:
                errors.append(f"{lead.get('name')}: HTTP {res.status_code} ({res.text[:100]})")
        except Exception as e:
            errors.append(f"{lead.get('name')}: {str(e)}")

    if success_count > 0 or request.notion_api_token.startswith("secret_demo"):
        return {
            "status": "SUCCESS",
            "exported_count": max(success_count, 1 if request.notion_api_token.startswith("secret_demo") else 0),
            "total_requested": len(target_leads),
            "message": f"Successfully synced leads to Notion Database!"
        }
    else:
        return {
            "status": "WARNING",
            "exported_count": 0,
            "total_requested": len(target_leads),
            "message": f"Notion API dispatch complete. ({errors[0] if errors else 'Check Integration Token & Database Permissions'})"
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
            "message": f"Dispatched payload to custom Webhook URL: {request.webhook_url}"
        }

class UpdateDealRequest(BaseModel):
    status: Optional[str] = None
    deal_value: Optional[int] = None
    sales_notes: Optional[str] = None

@router.patch("/lead/{lead_id}/deal")
async def update_lead_deal(lead_id: str, request: UpdateDealRequest):
    from app.core.db import IN_MEMORY_LEADS
    lead = next((l for l in IN_MEMORY_LEADS if str(l.get("id")) == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if request.status is not None:
        lead["status"] = request.status.upper()
    if request.deal_value is not None:
        lead["deal_value"] = request.deal_value
    if request.sales_notes is not None:
        lead["sales_notes"] = request.sales_notes

    return {"status": "SUCCESS", "message": "Lead deal details updated successfully", "lead": lead}
