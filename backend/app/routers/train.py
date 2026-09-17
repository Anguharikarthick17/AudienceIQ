"""AudienceIQ — /train router"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, HTTPException, status

from app.config import UPLOADED_DATASET_PATH
from app.ml.inspector import inspect_dataset
from app.ml.trainer import train_pipeline
from app.models import TrainRequest, TrainResponse
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/train", response_model=TrainResponse, tags=["Training"])
async def train(req: TrainRequest = None) -> TrainResponse:
    """
    Trigger model training on the uploaded dataset.

    - Inspects columns heuristically
    - Evaluates K range by silhouette score
    - Persists pipeline + metadata + cluster profiles
    - Reloads model into app state
    """
    dataset_path = UPLOADED_DATASET_PATH

    if not dataset_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No dataset found. Please upload a CSV dataset first via POST /upload.",
        )

    logger.info("Loading dataset from %s …", dataset_path)
    try:
        df = pd.read_csv(dataset_path, low_memory=False)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read dataset: {exc}",
        )

    if df.empty or len(df) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Dataset has only {len(df)} rows — too few to train a meaningful model.",
        )

    # Inspect to get feature mapping
    logger.info("Inspecting dataset …")
    try:
        inspection = inspect_dataset(df)
    except Exception as exc:
        logger.exception("Inspection failed during training")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Dataset inspection failed.",
        )

    detected = inspection["detected"]

    # Train
    logger.info("Starting training …")
    try:
        result = train_pipeline(df, detected)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Training failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Training failed. Check server logs for details.",
        )

    # Reload model into app state
    app_state.reload()
    logger.info("Model reloaded. %d clusters found.", result["n_clusters"])

    return TrainResponse(
        status="success",
        n_clusters=result["n_clusters"],
        silhouette_score=result["silhouette_score"],
        inertia=result["inertia"],
        n_users=result["n_users"],
        trained_at=result["trained_at"],
        k_evaluation=result["k_evaluation"],
        message=(
            f"Training complete. {result['n_clusters']} audience segments identified "
            f"across {result['n_users']} users (silhouette score: {result['silhouette_score']:.4f})."
        ),
    )
