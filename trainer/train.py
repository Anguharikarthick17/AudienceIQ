"""
AudienceIQ — Standalone Trainer Service

Reads a CSV dataset from /data/dataset.csv (or generates synthetic demo data
if no real dataset is present), runs the full ML pipeline, and persists
artifacts to /models.

This runs as a one-shot Docker container.
"""
from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# ---- Bootstrap: add /app or local backend to path -------------------------
sys.path.insert(0, "/app")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.config import DATA_DIR, MODELS_DIR, UPLOADED_DATASET_PATH
from app.ml.inspector import inspect_dataset
from app.ml.trainer import train_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("trainer")


# ---------------------------------------------------------------------------
# Synthetic demo data generator
# ---------------------------------------------------------------------------

def generate_synthetic_dataset(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    """
    Generate a realistic synthetic OTT dataset when no real data is available.
    Columns mirror common OTT behavioral schemas.
    """
    rng = np.random.default_rng(seed)

    GENRES = [
        "Action", "Drama", "Comedy", "Thriller", "Sci-Fi",
        "Documentary", "Romance", "Horror", "Animation", "Reality"
    ]

    user_ids = [f"USR-{i:05d}" for i in range(n)]

    # Simulate 4 audience archetypes
    archetype = rng.choice(["heavy", "moderate", "casual", "binge"], size=n, p=[0.25, 0.35, 0.25, 0.15])

    records = []
    for i, uid in enumerate(user_ids):
        a = archetype[i]

        if a == "heavy":
            watch_time = rng.normal(120, 30)
            session_dur = rng.normal(90, 20)
            sessions = rng.normal(12, 3)
            completion = rng.beta(8, 2)
            genres = rng.choice(GENRES, size=rng.integers(1, 4), replace=False).tolist()
        elif a == "moderate":
            watch_time = rng.normal(45, 15)
            session_dur = rng.normal(45, 15)
            sessions = rng.normal(6, 2)
            completion = rng.beta(5, 3)
            genres = rng.choice(GENRES, size=rng.integers(2, 5), replace=False).tolist()
        elif a == "casual":
            watch_time = rng.normal(10, 5)
            session_dur = rng.normal(20, 10)
            sessions = rng.normal(2, 1)
            completion = rng.beta(2, 5)
            genres = rng.choice(GENRES, size=rng.integers(1, 3), replace=False).tolist()
        else:  # binge
            watch_time = rng.normal(80, 20)
            session_dur = rng.normal(150, 30)
            sessions = rng.normal(4, 1)
            completion = rng.beta(9, 1)
            genres = rng.choice(GENRES[:5], size=2, replace=False).tolist()

        records.append({
            "user_id": uid,
            "watch_time_hours": max(0.1, round(watch_time, 2)),
            "avg_session_duration_mins": max(1.0, round(session_dur, 2)),
            "sessions_per_week": max(0.5, round(sessions, 1)),
            "completion_rate": round(min(1.0, max(0.0, completion)), 3),
            "top_genre": genres[0],
            "genre_list": "|".join(genres),
            "days_since_last_watch": int(rng.integers(0, 30)),
            "weekend_activity_ratio": round(rng.uniform(0.2, 0.8), 2),
        })

    return pd.DataFrame(records)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    logger.info("=== AudienceIQ Trainer Starting ===")

    # ---- Load or generate dataset ------------------------------------------
    dataset_path = UPLOADED_DATASET_PATH

    if dataset_path.exists():
        logger.info("Real dataset found at %s", dataset_path)
        df = pd.read_csv(dataset_path, low_memory=False)
        logger.info("Loaded %d rows × %d cols", *df.shape)
    else:
        logger.warning(
            "No real dataset at %s — generating synthetic demo data (2000 users)",
            dataset_path,
        )
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        df = generate_synthetic_dataset(n=2000)
        df.to_csv(dataset_path, index=False)
        logger.info("Synthetic dataset saved to %s", dataset_path)

    if len(df) < 10:
        logger.error("Dataset has fewer than 10 rows — aborting.")
        sys.exit(1)

    # ---- Inspect ------------------------------------------------------------
    logger.info("Inspecting dataset …")
    inspection = inspect_dataset(df)
    quality = inspection["quality"]
    detected = inspection["detected"]

    logger.info(
        "Quality: %d rows, %d cols, %d behavioral features detected",
        quality.total_rows,
        quality.total_cols,
        quality.usable_behavioral_features,
    )

    if quality.warnings:
        for w in quality.warnings:
            logger.warning("Dataset warning: %s", w)

    if not quality.ready_to_train:
        logger.error("Dataset not ready for training. Warnings: %s", quality.warnings)
        sys.exit(1)

    # ---- Train --------------------------------------------------------------
    logger.info("Starting training pipeline …")
    try:
        result = train_pipeline(df, detected)
    except Exception as exc:
        logger.exception("Training failed: %s", exc)
        sys.exit(1)

    # ---- Summary ------------------------------------------------------------
    logger.info("=== Training Complete ===")
    logger.info("  K (clusters)     : %d", result["n_clusters"])
    logger.info("  Silhouette score : %.4f", result["silhouette_score"])
    logger.info("  Inertia          : %.2f", result["inertia"])
    logger.info("  Users trained on : %d", result["n_users"])
    logger.info("  Trained at       : %s", result["trained_at"])
    logger.info("  K evaluation     :")
    for entry in result["k_evaluation"]:
        logger.info("    K=%d → silhouette=%.4f inertia=%.2f",
                    entry["k"], entry["silhouette_score"], entry["inertia"])

    logger.info("Artifacts written to /models/")
    logger.info("=== Trainer exiting (0) ===")


if __name__ == "__main__":
    main()
