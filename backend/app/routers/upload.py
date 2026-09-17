"""AudienceIQ — /upload router"""
from __future__ import annotations

import io
import logging
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import DATA_DIR, UPLOADED_DATASET_PATH
from app.ml.inspector import inspect_dataset
from app.models import DatasetInspectionResponse
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"}
MAX_FILE_SIZE_MB = 500


@router.post("/upload", response_model=DatasetInspectionResponse, tags=["Dataset"])
async def upload_dataset(file: UploadFile = File(...)) -> DatasetInspectionResponse:
    """
    Upload a CSV dataset and receive a full structural inspection.

    - Detects column types, missing values, duplicates
    - Identifies behavioral feature columns heuristically
    - Does NOT assume a fixed schema
    """
    # ---- Validate file type ------------------------------------------------
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        if not (file.filename or "").lower().endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only CSV files are accepted. Received content-type: {file.content_type}",
            )

    # ---- Read file ---------------------------------------------------------
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({size_mb:.1f} MB). Max is {MAX_FILE_SIZE_MB} MB.",
        )

    # ---- Parse CSV ---------------------------------------------------------
    try:
        df = pd.read_csv(io.BytesIO(contents), low_memory=False)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse CSV file: {exc}",
        )

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded CSV is empty.",
        )

    # ---- Save dataset ------------------------------------------------------
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(UPLOADED_DATASET_PATH, "wb") as f:
        f.write(contents)
    logger.info("Dataset saved to %s (%d rows, %d cols)", UPLOADED_DATASET_PATH, *df.shape)

    # ---- Inspect -----------------------------------------------------------
    try:
        inspection = inspect_dataset(df, filename=file.filename or "dataset.csv")
    except Exception as exc:
        logger.exception("Inspection failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Dataset inspection failed. Check server logs.",
        )

    # Cache quality for dashboard
    app_state.dataset_quality = inspection["quality"]

    return DatasetInspectionResponse(
        filename=file.filename or "dataset.csv",
        quality=inspection["quality"],
        columns=inspection["columns"],
        detected_features=inspection["detected"],
        message=(
            "Dataset uploaded and inspected successfully. "
            "Ready to train." if inspection["quality"].ready_to_train
            else "Dataset uploaded. Review warnings before training."
        ),
    )
