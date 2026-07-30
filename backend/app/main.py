import time
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import router
from app.api.export_routes import router as export_router
from app.api.webhook_routes import router as webhook_router
from app.api.schedule_routes import router as schedule_router
from app.api.crm_routes import router as crm_router
from app.api.ai_routes import router as ai_router
from app.api.broadcast_routes import router as broadcast_router
from app.api.settings_routes import router as settings_router

app = FastAPI(title="Leads Finder Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Rate Limiting Engine per Client IP (60 requests / minute)
IP_REQUEST_LOGS = {}
RATE_LIMIT_PER_MINUTE = 60

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Allow health check & static endpoints
    if request.url.path == "/" or request.url.path.startswith("/docs") or request.url.path.startswith("/openapi"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Clean old timestamps (> 60 seconds)
    if client_ip in IP_REQUEST_LOGS:
        IP_REQUEST_LOGS[client_ip] = [ts for ts in IP_REQUEST_LOGS[client_ip] if now - ts < 60]
    else:
        IP_REQUEST_LOGS[client_ip] = []

    request_count = len(IP_REQUEST_LOGS[client_ip])

    if request_count >= RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests from IP {client_ip}. Limit is {RATE_LIMIT_PER_MINUTE} requests per minute to prevent server abuse.",
                "retry_after_seconds": 60
            },
            headers={
                "X-RateLimit-Limit": str(RATE_LIMIT_PER_MINUTE),
                "X-RateLimit-Remaining": "0",
                "Retry-After": "60"
            }
        )

    IP_REQUEST_LOGS[client_ip].append(now)

    response: Response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_PER_MINUTE)
    response.headers["X-RateLimit-Remaining"] = str(RATE_LIMIT_PER_MINUTE - request_count - 1)
    return response

app.include_router(router, prefix="/api/v1")
app.include_router(export_router, prefix="/api/v1")
app.include_router(webhook_router, prefix="/api/v1")
app.include_router(schedule_router, prefix="/api/v1")
app.include_router(crm_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(broadcast_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Leads Finder Engine is running",
        "compliance": "GDPR Article 6(1)(f) & CCPA B2B Exempt Public Commercial Directory Search"
    }
