"""
AudienceIQ — Application Configuration
"""
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
MODELS_DIR = Path(os.getenv("MODELS_DIR", "/models"))
DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))

PIPELINE_PATH = MODELS_DIR / "pipeline.joblib"
METADATA_PATH = MODELS_DIR / "metadata.json"
CLUSTER_PROFILES_PATH = MODELS_DIR / "cluster_profiles.json"
UPLOADED_DATASET_PATH = DATA_DIR / "dataset.csv"

# ---------------------------------------------------------------------------
# ML hyperparameters
# ---------------------------------------------------------------------------
RANDOM_STATE: int = 42
K_MIN: int = 2
K_MAX: int = 10          # hard cap; further capped by n_users // 50 at runtime
K_MAX_USERS_RATIO: int = 50  # min users per cluster to keep K sensible

# ---------------------------------------------------------------------------
# API settings
# ---------------------------------------------------------------------------
MAX_WATCH_TIME_HOURS: float = 8_760.0   # 1 year cap for sanity
MAX_SESSION_MINS: float = 1_440.0       # 24 h cap
MAX_GENRES: int = 20

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ORIGINS = ["*"]
