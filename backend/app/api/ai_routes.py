from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.ai_pitch import AIPitchGenerator


router = APIRouter()
pitch_generator = AIPitchGenerator()

class PitchRequest(BaseModel):
    business_name: str
    category: Optional[str] = "Bisnis"
    location: Optional[str] = "Indonesia"
    website: Optional[str] = None
    my_offer: Optional[str] = None

@router.post("/generate-pitch")
async def generate_ai_pitch(request: PitchRequest):
    if not request.business_name.strip():
        raise HTTPException(status_code=400, detail="Business name is required")

    result = pitch_generator.generate_pitch(
        business_name=request.business_name.strip(),
        category=request.category or "Bisnis",
        location=request.location or "Indonesia",
        website=request.website,
        my_offer=request.my_offer
    )

    return {"status": "SUCCESS", "pitch": result}
