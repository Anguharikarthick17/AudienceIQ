"""
AudienceIQ — Application Configuration
"""
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
def _resolve_models_dir() -> Path:
    if os.getenv("MODELS_DIR"):
        return Path(os.environ["MODELS_DIR"])
    # 1. Docker Compose / container volume
    docker_models = Path("/models")
    if (docker_models / "pipeline.joblib").exists():
        return docker_models
    # 2. Repo root /models (native Render deployment or local development)
    repo_models = Path(__file__).resolve().parent.parent.parent / "models"
    if (repo_models / "pipeline.joblib").exists():
        return repo_models
    # 3. Relative models folder
    cwd_models = Path("models").resolve()
    if (cwd_models / "pipeline.joblib").exists():
        return cwd_models
    return docker_models if docker_models.exists() else repo_models


def _resolve_data_dir() -> Path:
    if os.getenv("DATA_DIR"):
        return Path(os.environ["DATA_DIR"])
    docker_data = Path("/data")
    if docker_data.exists():
        return docker_data
    repo_data = Path(__file__).resolve().parent.parent.parent / "data"
    if repo_data.exists():
        return repo_data
    cwd_data = Path("data").resolve()
    if cwd_data.exists():
        return cwd_data
    return docker_data


MODELS_DIR = _resolve_models_dir()
DATA_DIR = _resolve_data_dir()

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
_cors_env = os.getenv("CORS_ORIGINS")
if _cors_env:
    CORS_ORIGINS = [orig.strip() for orig in _cors_env.split(",") if orig.strip()]
else:
    CORS_ORIGINS = ["*"]

