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

from typing import Optional, Dict, Any

router = APIRouter()

# Global Backend System Settings Registry
SYSTEM_SETTINGS: Dict[str, Any] = {
    "http_proxy": None,
    "https_proxy": None,
    "openai_api_key": None,
    "google_genai_key": None,
    "fonnte_wa_token": None,
    "max_crawl_depth": 3,
    "enable_deep_verification": True
}

class SettingsRequest(BaseModel):
    http_proxy: Optional[str] = None
    https_proxy: Optional[str] = None
    openai_api_key: Optional[str] = None
    google_genai_key: Optional[str] = None
    fonnte_wa_token: Optional[str] = None
    max_crawl_depth: Optional[int] = 3

def get_active_proxy() -> Optional[Dict[str, str]]:
    http_p = SYSTEM_SETTINGS.get("http_proxy")
    https_p = SYSTEM_SETTINGS.get("https_proxy") or http_p
    if http_p:
        return {"http://": http_p, "https://": https_p}
    return None

@router.get("/settings")
async def get_settings():
    # Mask API keys for security
    masked = SYSTEM_SETTINGS.copy()
    if masked.get("openai_api_key"):
        masked["openai_api_key"] = masked["openai_api_key"][:6] + "..."
    if masked.get("google_genai_key"):
        masked["google_genai_key"] = masked["google_genai_key"][:6] + "..."
    return {"status": "SUCCESS", "settings": masked}

@router.post("/settings")
async def update_settings(request: SettingsRequest):
    if request.http_proxy is not None:
        SYSTEM_SETTINGS["http_proxy"] = request.http_proxy.strip() if request.http_proxy else None
    if request.https_proxy is not None:
        SYSTEM_SETTINGS["https_proxy"] = request.https_proxy.strip() if request.https_proxy else None
    if request.openai_api_key is not None:
        SYSTEM_SETTINGS["openai_api_key"] = request.openai_api_key.strip() if request.openai_api_key else None
    if request.google_genai_key is not None:
        SYSTEM_SETTINGS["google_genai_key"] = request.google_genai_key.strip() if request.google_genai_key else None
    if request.fonnte_wa_token is not None:
        SYSTEM_SETTINGS["fonnte_wa_token"] = request.fonnte_wa_token.strip() if request.fonnte_wa_token else None
    if request.max_crawl_depth is not None:
        SYSTEM_SETTINGS["max_crawl_depth"] = request.max_crawl_depth

    return {"status": "SUCCESS", "message": "Backend system & proxy settings updated successfully!"}
