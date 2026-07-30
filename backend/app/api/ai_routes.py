from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai_pitch import AIPitchGenerator
from app.core.db import get_all_leads

router = APIRouter()
pitch_generator = AIPitchGenerator()

class PitchRequest(BaseModel):
    business_name: str
    category: Optional[str] = "Bisnis"
    location: Optional[str] = "Indonesia"
    website: Optional[str] = None
    my_offer: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    lead_grade: Optional[str] = "WARM"
    icp_reasoning: Optional[str] = None
    company_summary: Optional[str] = None
    decision_maker_name: Optional[str] = None
    decision_maker_title: Optional[str] = None

@router.post("/generate-pitch")
async def generate_ai_pitch(request: PitchRequest):
    if not request.business_name.strip():
        raise HTTPException(status_code=400, detail="Business name is required")

    result = pitch_generator.generate_pitch(
        business_name=request.business_name.strip(),
        category=request.category or "Bisnis",
        location=request.location or "Indonesia",
        website=request.website,
        my_offer=request.my_offer,
        tech_stack=request.tech_stack,
        lead_grade=request.lead_grade,
        icp_reasoning=request.icp_reasoning,
        company_summary=request.company_summary,
        decision_maker_name=request.decision_maker_name,
        decision_maker_title=request.decision_maker_title
    )

    return {"status": "SUCCESS", "pitch": result}

@router.get("/generate-pitch-by-lead-id/{lead_id}")
async def generate_pitch_by_lead_id(lead_id: str, my_offer: Optional[str] = None):
    all_leads = get_all_leads()
    matched_lead = next((l for l in all_leads if str(l.get("id")) == lead_id), None)
    
    if not matched_lead:
        raise HTTPException(status_code=404, detail=f"Lead with ID '{lead_id}' not found")

    result = pitch_generator.generate_pitch(
        business_name=matched_lead.get("name", "Bisnis Target"),
        category=matched_lead.get("category", "Bisnis"),
        location=matched_lead.get("location", "Indonesia"),
        website=matched_lead.get("website"),
        my_offer=my_offer,
        tech_stack=matched_lead.get("tech_stack"),
        lead_grade=matched_lead.get("lead_grade"),
        icp_reasoning=matched_lead.get("icp_reasoning"),
        company_summary=matched_lead.get("company_summary"),
        decision_maker_name=matched_lead.get("decision_maker_name"),
        decision_maker_title=matched_lead.get("decision_maker_title")
    )

    return {"status": "SUCCESS", "lead_id": lead_id, "pitch": result}
