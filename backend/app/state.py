"""
AudienceIQ — Application State

Singleton holding the loaded ML pipeline and metadata,
shared across all request handlers.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
from sklearn.pipeline import Pipeline

from app.config import CLUSTER_PROFILES_PATH, METADATA_PATH, PIPELINE_PATH

logger = logging.getLogger(__name__)


class AppState:
    def __init__(self) -> None:
        self.pipeline: Optional[Pipeline] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.cluster_profiles: Optional[Dict[int, Dict[str, Any]]] = None
        self.dataset_quality: Optional[Any] = None

    def load_model(self) -> bool:
        """
        Attempt to load persisted pipeline and metadata.
        Returns True if successful, False if model not yet trained.
        """
        if not PIPELINE_PATH.exists():
            logger.info("No pipeline artifact found at %s", PIPELINE_PATH)
            return False

        try:
            self.pipeline = joblib.load(PIPELINE_PATH)
            logger.info("Pipeline loaded from %s", PIPELINE_PATH)
        except Exception as exc:
            logger.error("Failed to load pipeline: %s", exc)
            return False

        if METADATA_PATH.exists():
            try:
                with open(METADATA_PATH) as f:
                    self.metadata = json.load(f)
            except Exception as exc:
                logger.warning("Failed to load metadata: %s", exc)
                self.metadata = {}

        if CLUSTER_PROFILES_PATH.exists():
            try:
                with open(CLUSTER_PROFILES_PATH) as f:
                    raw = json.load(f)
                # Keys are int cluster IDs but JSON keys are strings
                self.cluster_profiles = {int(k): v for k, v in raw.items()}
            except Exception as exc:
                logger.warning("Failed to load cluster profiles: %s", exc)
                self.cluster_profiles = {}

        return True

    def reload(self) -> bool:
        """Reload after training."""
        self.pipeline = None
        self.metadata = None
        self.cluster_profiles = None
        return self.load_model()

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None

    def get_segment_name(self, cluster_id: int) -> str:
        if self.cluster_profiles:
            profile = self.cluster_profiles.get(cluster_id, {})
            return profile.get("segment_name", f"Segment {cluster_id}")
        return f"Segment {cluster_id}"

    def get_cluster_profile(self, cluster_id: int) -> Dict[str, Any]:
        if self.cluster_profiles:
            return self.cluster_profiles.get(cluster_id, {})
        return {}

    def get_feature_names(self) -> list:
        if self.metadata:
            return self.metadata.get("feature_names", [])
        return []


# Global singleton
app_state = AppState()
