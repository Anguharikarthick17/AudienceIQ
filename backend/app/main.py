"""
AudienceIQ — FastAPI Application Entry Point
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS
from app.routers import analyze, dashboard, health, model_info, recommend, segments, train, upload
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
