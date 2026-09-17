"""
AudienceIQ — Shared Model Service

Centralized model inference utility that strictly reuses the existing persisted
StandardScaler + KMeans pipeline without retraining or creating duplicate models.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from app.ml.feature_eng import _normalize_genre
from app.state import app_state

logger = logging.getLogger(__name__)

# Canonical feature schema in exact training order
CANONICAL_FEATURES = [
    "watch_time__watch_time_hours",
    "session_dur__avg_session_duration_mins",
    "session_cnt__sessions_per_week",
    "completion__completion_rate",
    "recency__days_since_last_watch",
    "activity__weekend_activity_ratio",
    "genre__Action",
    "genre__Animation",
    "genre__Comedy",
    "genre__Documentary",
    "genre__Drama",
    "genre__Horror",
    "genre__Romance",
    "genre__Sci-Fi",
    "genre__Thriller",
    "genre__Reality",
]

# Dataset benchmark medians and safe limits from audited 2000 users
FEATURE_BENCHMARKS = {
    "watch_time_hours": {"min": 0.1, "median": 52.3, "max": 240.8, "safe_cap": 300.0},
    "avg_session_mins": {"min": 1.0, "median": 53.6, "max": 230.6, "safe_cap": 300.0},
    "sessions_per_week": {"min": 0.5, "median": 5.1, "max": 21.3, "safe_cap": 30.0},
    "completion_rate": {"min": 0.007, "median": 0.681, "max": 1.0, "safe_cap": 1.0},
    "days_since_last_watch": {"min": 0.0, "median": 15.0, "max": 29.0, "safe_cap": 30.0},
    "weekend_activity_ratio": {"min": 0.2, "median": 0.50, "max": 0.8, "safe_cap": 1.0},
}


class ModelService:
    @staticmethod
    def get_feature_names() -> List[str]:
        names = app_state.get_feature_names()
        return names if names else CANONICAL_FEATURES

    @classmethod
    def build_vector(
        cls,
        watch_time_hours: float,
        avg_session_mins: float,
        top_genres: List[str],
        sessions_per_week: Optional[float] = None,
        completion_rate: Optional[float] = None,
        days_since_last_watch: Optional[float] = None,
        weekend_activity_ratio: Optional[float] = None,
    ) -> pd.DataFrame:
        """
        Build a 16-dimensional DataFrame aligned with the trained feature schema.
        Applies safe clipping based on dataset boundaries and normalizes genres.
        """
        feature_names = cls.get_feature_names()

        # Normalize and filter genres safely
        normalized_genres = set()
        for g in (top_genres or []):
            norm = _normalize_genre(str(g))
            if norm:
                normalized_genres.add(norm)

        # Default fallbacks based on dataset medians if omitted
        spw = sessions_per_week if sessions_per_week is not None else (
            round((watch_time_hours * 60) / (avg_session_mins * 4), 2)
            if avg_session_mins > 0 else 5.1
        )
        comp = completion_rate if completion_rate is not None else 0.68
        recency = days_since_last_watch if days_since_last_watch is not None else 14.0
        weekend = weekend_activity_ratio if weekend_activity_ratio is not None else 0.50

        # Safe bounding
        wt = float(np.clip(watch_time_hours, 0.01, 300.0))
        sd = float(np.clip(avg_session_mins, 0.1, 300.0))
        spw = float(np.clip(spw, 0.0, 30.0))
        comp = float(np.clip(comp, 0.0, 1.0))
        recency = float(np.clip(recency, 0.0, 60.0))
        weekend = float(np.clip(weekend, 0.0, 1.0))

        row: Dict[str, float] = {}
        for col in feature_names:
            if col == "watch_time__watch_time_hours" or col.startswith("watch_time__"):
                row[col] = wt
            elif col == "session_dur__avg_session_duration_mins" or col.startswith("session_dur__"):
                row[col] = sd
            elif col == "session_cnt__sessions_per_week" or col.startswith("session_cnt__"):
                row[col] = spw
            elif col == "completion__completion_rate" or col.startswith("completion__"):
                row[col] = comp
            elif col == "recency__days_since_last_watch" or col.startswith("recency__"):
                row[col] = recency
            elif col == "activity__weekend_activity_ratio" or col.startswith("activity__"):
                row[col] = weekend
            elif col.startswith("genre__"):
                g_name = col.split("genre__", 1)[1]
                row[col] = 1.0 if g_name in normalized_genres else 0.0
            else:
                row[col] = 0.0

        return pd.DataFrame([row], columns=feature_names)

    @classmethod
    def run_inference(cls, feature_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Execute prediction through the existing persisted pipeline without retraining.
        Computes distance to ALL cluster centroids.
        """
        if not app_state.is_ready:
            raise RuntimeError("Model pipeline is not loaded in app_state.")

        pipeline = app_state.pipeline
        scaler = pipeline.named_steps["scaler"]
        kmeans = pipeline.named_steps["kmeans"]

        feature_names = cls.get_feature_names()
        # Guarantee alignment
        df_aligned = feature_df.reindex(columns=feature_names, fill_value=0.0)

        scaled_vals = scaler.transform(df_aligned.values)
        cluster_id = int(kmeans.predict(scaled_vals)[0])

        centers = kmeans.cluster_centers_  # shape: (n_clusters, n_features)
        distances: Dict[int, float] = {}
        for c_idx, center in enumerate(centers):
            dist = float(np.linalg.norm(scaled_vals[0] - center))
            distances[c_idx] = round(dist, 4)

        segment_name = app_state.get_segment_name(cluster_id)
        cluster_profile = app_state.get_cluster_profile(cluster_id)

        return {
            "cluster_id": cluster_id,
            "segment_name": segment_name,
            "distance_to_assigned_centroid": distances[cluster_id],
            "distances_to_all_centroids": distances,
            "scaled_vector": scaled_vals[0],
            "raw_features": df_aligned.iloc[0].to_dict(),
            "cluster_profile": cluster_profile,
        }

    @classmethod
    def calculate_counterfactual_attribution(
        cls,
        orig_inference: Dict[str, Any],
        cf_inference: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Calculates feature attribution explaining which changed features
        contributed to the segment shift or centroid distance movement.
        """
        feature_names = cls.get_feature_names()
        pipeline = app_state.pipeline
        kmeans = pipeline.named_steps["kmeans"]
        centers = kmeans.cluster_centers_

        orig_scaled = orig_inference["scaled_vector"]
        cf_scaled = cf_inference["scaled_vector"]
        orig_raw = orig_inference["raw_features"]
        cf_raw = cf_inference["raw_features"]

        target_cluster = cf_inference["cluster_id"]
        target_center = centers[target_cluster]

        attributions = []

        for idx, col in enumerate(feature_names):
            orig_val = orig_raw.get(col, 0.0)
            cf_val = cf_raw.get(col, 0.0)
            raw_delta = cf_val - orig_val

            if abs(raw_delta) < 1e-4:
                continue

            # In scaled space, calculate whether this feature brought the point closer to the target centroid
            dist_before_sq = (orig_scaled[idx] - target_center[idx]) ** 2
            dist_after_sq = (cf_scaled[idx] - target_center[idx]) ** 2
            pull_towards_target = float(dist_before_sq - dist_after_sq)

            # Friendly feature naming
            friendly_name = col
            if col.startswith("genre__"):
                friendly_name = f"Genre: {col.replace('genre__', '')}"
            elif col == "watch_time__watch_time_hours":
                friendly_name = "Watch Time (hours)"
            elif col == "session_dur__avg_session_duration_mins":
                friendly_name = "Avg Session Duration (mins)"
            elif col == "session_cnt__sessions_per_week":
                friendly_name = "Sessions Per Week"
            elif col == "completion__completion_rate":
                friendly_name = "Completion Rate"
            elif col == "recency__days_since_last_watch":
                friendly_name = "Days Since Last Watch"
            elif col == "activity__weekend_activity_ratio":
                friendly_name = "Weekend Activity Ratio"

            attributions.append({
                "feature_name": col,
                "display_name": friendly_name,
                "original_value": round(float(orig_val), 3),
                "counterfactual_value": round(float(cf_val), 3),
                "delta": round(float(raw_delta), 3),
                "pull_towards_target_centroid": round(pull_towards_target, 4),
                "importance_rank": abs(pull_towards_target),
            })

        attributions.sort(key=lambda x: x["importance_rank"], reverse=True)
        return attributions


model_service = ModelService()
