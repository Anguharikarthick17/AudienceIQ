"""
AudienceIQ — FastAPI Application Entry Point
"""
from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path when running standalone or via uvicorn from root
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS
from app.routers import advanced_intelligence, analyze, dashboard, health, model_info, recommend, segments, train, upload
from app.state import app_state

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AudienceIQ API",
    description="Explainable OTT Audience Intelligence & Personalization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handler (never expose stack traces)
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )


# ---------------------------------------------------------------------------
# Startup: attempt to load persisted model
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event() -> None:
    logger.info("AudienceIQ API starting …")
    loaded = app_state.load_model()
    if loaded:
        meta = app_state.metadata or {}
        logger.info(
            "Model loaded: %d clusters, trained_at=%s",
            meta.get("n_clusters", "?"),
            meta.get("trained_at", "unknown"),
        )
    else:
        logger.info("No persisted model found. Upload a dataset and trigger training.")


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(train.router)
app.include_router(recommend.router)
app.include_router(analyze.router)
app.include_router(dashboard.router)
app.include_router(segments.router)
app.include_router(model_info.router)
app.include_router(advanced_intelligence.router)


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@app.get("/", tags=["System"])
async def root():
    return {
        "service": "AudienceIQ API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# ---------------------------------------------------------------------------
# Direct entrypoint (listens on 0.0.0.0 and $PORT or 8000)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, workers=1)

