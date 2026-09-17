"""AudienceIQ — /model-info router"""
from __future__ import annotations

from fastapi import APIRouter

from app.config import PIPELINE_PATH
from app.models import KEvalPoint, ModelInfoResponse
from app.state import app_state

router = APIRouter()


@router.get("/model-info", response_model=ModelInfoResponse, tags=["System"])
async def model_info() -> ModelInfoResponse:
    """Return ML evidence: selected K, silhouette score, inertia, cluster balance."""
    meta = app_state.metadata
    artifact_exists = PIPELINE_PATH.exists()

    if not meta:
        return ModelInfoResponse(
            model_loaded=False,
            model_status="not_trained",
            trained_at=None,
            selected_k=None,
            silhouette_score=None,
            inertia=None,
            n_training_users=None,
            cluster_balance=None,
            k_evaluation=None,
            pipeline_path=str(PIPELINE_PATH),
            artifact_exists=artifact_exists,
        )

    k_eval = [
        KEvalPoint(
            k=e["k"],
            silhouette_score=e["silhouette_score"],
            inertia=e["inertia"],
        )
        for e in meta.get("k_evaluation", [])
    ]

    return ModelInfoResponse(
        model_loaded=app_state.is_ready,
        model_status="trained" if app_state.is_ready else "artifact_exists_not_loaded",
        trained_at=meta.get("trained_at"),
        selected_k=meta.get("n_clusters"),
        silhouette_score=meta.get("silhouette_score"),
        inertia=meta.get("inertia"),
        n_training_users=meta.get("n_training_users"),
        cluster_balance=meta.get("cluster_sizes"),
        k_evaluation=k_eval,
        pipeline_path=str(PIPELINE_PATH),
        artifact_exists=artifact_exists,
    )
