"""AudienceIQ — /health router"""
from fastapi import APIRouter
from app.models import HealthResponse
from app.state import app_state

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health() -> HealthResponse:
    """
    Returns API health and model load status.
    Used by Docker healthcheck and evaluator service.
    """
    meta = app_state.metadata
    return HealthResponse(
        status="ok",
        model_loaded=app_state.pipeline is not None,
        model_trained_at=meta.get("trained_at") if meta else None,
        n_clusters=meta.get("n_clusters") if meta else None,
        n_training_users=meta.get("n_training_users") if meta else None,
    )
