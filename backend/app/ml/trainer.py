"""
AudienceIQ — KMeans Trainer

Evaluates a range of K values, selects K by silhouette score,
fits the final pipeline, and persists everything under /models.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.config import (
    CLUSTER_PROFILES_PATH,
    K_MAX,
    K_MAX_USERS_RATIO,
    K_MIN,
    METADATA_PATH,
    MODELS_DIR,
    PIPELINE_PATH,
    RANDOM_STATE,
)
from app.ml.feature_eng import DetectedFeatures, engineer_features
from app.ml.inspector import inspect_dataset
from app.ml.namer import name_segments

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Core training function
# ---------------------------------------------------------------------------

def train_pipeline(
    df: pd.DataFrame,
    detected: DetectedFeatures,
) -> Dict[str, Any]:
    """
    Full training pipeline:
      1. Feature engineering
      2. K evaluation (silhouette + inertia)
      3. Select best K
      4. Fit StandardScaler → KMeans
      5. Persist artifacts
      6. Return training report

    Returns a dict with all training metadata.
    """
    logger.info("Starting feature engineering …")
    feature_df, user_index = engineer_features(df, detected)
    n_users, n_features = feature_df.shape
    logger.info("Feature matrix: %d users × %d features", n_users, n_features)

    if n_users < 10:
        raise ValueError(f"Too few users ({n_users}) to cluster meaningfully.")

    feature_matrix = feature_df.values.astype(np.float64)

    # ---- K evaluation -------------------------------------------------------
    k_upper = min(K_MAX, max(K_MIN, n_users // K_MAX_USERS_RATIO))
    k_range = list(range(K_MIN, k_upper + 1))
    logger.info("Evaluating K in %s …", k_range)

    k_evaluation: List[Dict[str, Any]] = []
    best_k = K_MIN
    best_silhouette = -1.0

    for k in k_range:
        if k >= n_users:
            logger.warning("K=%d >= n_users=%d, skipping", k, n_users)
            continue

        km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = km.fit_predict(feature_matrix)
        sil = float(silhouette_score(feature_matrix, labels)) if len(set(labels)) > 1 else -1.0
        inertia = float(km.inertia_)

        k_evaluation.append({
            "k": k,
            "silhouette_score": round(sil, 6),
            "inertia": round(inertia, 4),
        })
        logger.info("  K=%d → silhouette=%.4f inertia=%.2f", k, sil, inertia)

        if sil > best_silhouette:
            best_silhouette = sil
            best_k = k

    logger.info("Selected K=%d (silhouette=%.4f)", best_k, best_silhouette)

    # ---- Final model fit ----------------------------------------------------
    scaler = StandardScaler()
    km_final = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=10)

    pipeline = Pipeline([
        ("scaler", scaler),
        ("kmeans", km_final),
    ])

    labels_final = pipeline.fit_predict(feature_matrix)
    final_inertia = float(pipeline.named_steps["kmeans"].inertia_)
    final_sil = float(silhouette_score(feature_matrix, labels_final)) if len(set(labels_final)) > 1 else -1.0

    # ---- Cluster profiles ---------------------------------------------------
    scaled_matrix = pipeline.named_steps["scaler"].transform(feature_matrix)
    feature_names = list(feature_df.columns)
    cluster_profiles = _compute_cluster_profiles(
        feature_df, labels_final, feature_names, user_index
    )

    # Name segments
    segment_names = name_segments(cluster_profiles, feature_names)
    for cid, profile in cluster_profiles.items():
        profile["segment_name"] = segment_names.get(cid, f"Segment {cid}")

    # Cluster balance
    cluster_sizes = [int((labels_final == k).sum()) for k in range(best_k)]

    # ---- Persist artifacts --------------------------------------------------
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(pipeline, PIPELINE_PATH)
    logger.info("Pipeline persisted → %s", PIPELINE_PATH)

    trained_at = datetime.now(timezone.utc).isoformat()

    metadata = {
        "trained_at": trained_at,
        "n_clusters": best_k,
        "silhouette_score": round(final_sil, 6),
        "inertia": round(final_inertia, 4),
        "n_training_users": n_users,
        "n_features": n_features,
        "feature_names": feature_names,
        "cluster_sizes": cluster_sizes,
        "k_evaluation": k_evaluation,
        "random_state": RANDOM_STATE,
    }

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    with open(CLUSTER_PROFILES_PATH, "w") as f:
        json.dump(cluster_profiles, f, indent=2, default=_json_safe)

    logger.info("Metadata persisted → %s", METADATA_PATH)
    logger.info("Cluster profiles persisted → %s", CLUSTER_PROFILES_PATH)

    return {
        "n_clusters": best_k,
        "silhouette_score": round(final_sil, 6),
        "inertia": round(final_inertia, 4),
        "n_users": n_users,
        "trained_at": trained_at,
        "k_evaluation": k_evaluation,
        "cluster_sizes": cluster_sizes,
    }


# ---------------------------------------------------------------------------
# Cluster profile computation
# ---------------------------------------------------------------------------

def _compute_cluster_profiles(
    feature_df: pd.DataFrame,
    labels: np.ndarray,
    feature_names: List[str],
    user_index: pd.Index,
) -> Dict[int, Dict[str, Any]]:
    """Compute per-cluster feature statistics."""
    profiles: Dict[int, Dict[str, Any]] = {}
    n_total = len(labels)

    for cid in sorted(set(labels)):
        mask = labels == cid
        cluster_df = feature_df[mask]
        n_users = int(mask.sum())

        # Feature means (unscaled, interpretable)
        means: Dict[str, float] = {
            col: round(float(cluster_df[col].mean()), 4)
            for col in feature_names
        }

        # Dominant genres
        genre_cols = [c for c in feature_names if c.startswith("genre__")]
        dominant_genres: List[str] = []
        if genre_cols:
            genre_means = {c: means[c] for c in genre_cols}
            sorted_genres = sorted(genre_means.items(), key=lambda x: x[1], reverse=True)
            dominant_genres = [
                c.replace("genre__", "") for c, v in sorted_genres if v >= 0.2
            ][:5]

        # Avg watch time
        wt_cols = [c for c in feature_names if c.startswith("watch_time__")]
        avg_wt = float(cluster_df[wt_cols].sum(axis=1).mean()) if wt_cols else 0.0

        # Avg session duration
        sd_cols = [c for c in feature_names if c.startswith("session_dur__")]
        avg_sd = float(cluster_df[sd_cols].mean().mean()) if sd_cols else 0.0

        # Session count
        sc_cols = [c for c in feature_names if c.startswith("session_cnt__")]
        avg_sc = float(cluster_df[sc_cols].mean().mean()) if sc_cols else 0.0

        # Completion rate
        comp_cols = [c for c in feature_names if c.startswith("completion__")]
        avg_comp = float(cluster_df[comp_cols].mean().mean()) if comp_cols else None

        profiles[int(cid)] = {
            "cluster_id": int(cid),
            "user_count": n_users,
            "audience_pct": round(n_users / n_total * 100, 2),
            "feature_means": means,
            "dominant_genres": dominant_genres,
            "avg_watch_time": round(avg_wt, 3),
            "avg_session_mins": round(avg_sd, 3),
            "avg_sessions": round(avg_sc, 3),
            "avg_completion_rate": round(avg_comp, 3) if avg_comp is not None else None,
        }

    return profiles


def _json_safe(obj: Any) -> Any:
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# ---------------------------------------------------------------------------
# Inference helper
# ---------------------------------------------------------------------------

def predict_segment(
    pipeline: Pipeline,
    feature_vector: pd.DataFrame,
) -> Tuple[int, float]:
    """
    Assign a user to a segment and compute distance to centroid.

    Returns (segment_id, distance_to_centroid)
    """
    scaled = pipeline.named_steps["scaler"].transform(feature_vector.values)
    label = int(pipeline.named_steps["kmeans"].predict(scaled)[0])
    centroid = pipeline.named_steps["kmeans"].cluster_centers_[label]
    distance = float(np.linalg.norm(scaled[0] - centroid))
    return label, round(distance, 6)
