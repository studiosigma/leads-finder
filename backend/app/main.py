from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .api.export_routes import router as export_router
from .api.webhook_routes import router as webhook_router
from .api.schedule_routes import router as schedule_router
from .api.crm_routes import router as crm_router
from .api.ai_routes import router as ai_router

app = FastAPI(title="Leads Finder Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
app.include_router(export_router, prefix="/api/v1")
app.include_router(webhook_router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api/v1")
app.include_router(crm_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Leads Finder Engine is running"}




