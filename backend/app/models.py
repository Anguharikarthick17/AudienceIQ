"""
AudienceIQ — Pydantic request / response models.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_trained_at: Optional[str] = None
    n_clusters: Optional[int] = None
    n_training_users: Optional[int] = None


# ---------------------------------------------------------------------------
# /recommend
# ---------------------------------------------------------------------------
class RecommendRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    watch_time_hours: float = Field(..., ge=0.01, le=8_760.0)
    top_genres: List[str] = Field(..., min_length=1, max_length=20)
    avg_session_mins: float = Field(..., ge=0.1, le=1_440.0)

    @field_validator("top_genres")
    @classmethod
    def genres_not_empty(cls, v: List[str]) -> List[str]:
        cleaned = [g.strip() for g in v if g.strip()]
        if not cleaned:
            raise ValueError("top_genres must contain at least one non-empty genre string")
        return cleaned

    @field_validator("watch_time_hours")
    @classmethod
    def watch_time_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("watch_time_hours must be positive")
        return v


class RecommendResponse(BaseModel):
    user_id: str
    segment_id: int
    segment_name: str
    recommendations: List[str]
    distance_to_centroid: float
    explanation: str
    confidence: str


# ---------------------------------------------------------------------------
# /upload — dataset inspection
# ---------------------------------------------------------------------------
class ColumnProfile(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[Any]


class DetectedFeatures(BaseModel):
    user_id_col: Optional[str]
    watch_time_cols: List[str]
    session_duration_cols: List[str]
    session_count_cols: List[str]
    genre_cols: List[str]
    completion_cols: List[str]
    recency_cols: List[str]
    activity_pattern_cols: List[str]
    unrecognized_numeric: List[str]
    unrecognized_categorical: List[str]


class DatasetQuality(BaseModel):
    total_rows: int
    total_cols: int
    duplicate_rows: int
    duplicate_pct: float
    missing_cells: int
    missing_cell_pct: float
    numeric_cols: int
    categorical_cols: int
    usable_behavioral_features: int
    ready_to_train: bool
    warnings: List[str]


class DatasetInspectionResponse(BaseModel):
    filename: str
    quality: DatasetQuality
    columns: List[ColumnProfile]
    detected_features: DetectedFeatures
    message: str


# ---------------------------------------------------------------------------
# /train
# ---------------------------------------------------------------------------
class TrainRequest(BaseModel):
    dataset_path: Optional[str] = None  # uses uploaded file if None


class TrainResponse(BaseModel):
    status: str
    n_clusters: int
    silhouette_score: float
    inertia: float
    n_users: int
    trained_at: str
    k_evaluation: List[Dict[str, Any]]
    message: str


# ---------------------------------------------------------------------------
# /dashboard
# ---------------------------------------------------------------------------
class SegmentSummary(BaseModel):
    segment_id: int
    segment_name: str
    user_count: int
    audience_pct: float
    avg_watch_time: float
    avg_session_mins: float
    dominant_genres: List[str]
    engagement_level: str


class DashboardResponse(BaseModel):
    total_viewers: int
    n_segments: int
    avg_watch_time: float
    avg_session_mins: float
    silhouette_score: float
    inertia: float
    segments: List[SegmentSummary]
    genre_distribution: Dict[str, int]
    dataset_quality: Optional[DatasetQuality]
    model_status: str


# ---------------------------------------------------------------------------
# /segments
# ---------------------------------------------------------------------------
class SegmentDetail(BaseModel):
    segment_id: int
    segment_name: str
    user_count: int
    audience_pct: float
    avg_watch_time: float
    avg_session_mins: float
    dominant_genres: List[str]
    engagement_level: str
    engagement_characteristics: List[str]
    recommendation_strategy: str
    behavioral_profile: Dict[str, Any]


# ---------------------------------------------------------------------------
# /analyze
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    watch_time_hours: float = Field(..., ge=0.01, le=8_760.0)
    top_genres: List[str] = Field(..., min_length=1, max_length=20)
    avg_session_mins: float = Field(..., ge=0.1, le=1_440.0)
    # Optional extra fields — forward-compatible
    sessions_per_week: Optional[float] = Field(default=None, ge=0)
    completion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @field_validator("top_genres")
    @classmethod
    def genres_not_empty(cls, v: List[str]) -> List[str]:
        cleaned = [g.strip() for g in v if g.strip()]
        if not cleaned:
            raise ValueError("top_genres must contain at least one non-empty genre string")
        return cleaned


class BehaviorSignal(BaseModel):
    signal: str
    value: str
    interpretation: str


class AnalyzeResponse(BaseModel):
    user_id: str
    segment_id: int
    segment_name: str
    audience_pct: float
    engagement_level: str
    dominant_content: List[str]
    behavior_signals: List[BehaviorSignal]
    segment_explanation: str
    recommendations: List[str]
    recommendation_rationales: List[str]
    distance_to_centroid: float


# ---------------------------------------------------------------------------
# /model-info
# ---------------------------------------------------------------------------
class KEvalPoint(BaseModel):
    k: int
    silhouette_score: float
    inertia: float


class ModelInfoResponse(BaseModel):
    model_loaded: bool
    model_status: str
    trained_at: Optional[str]
    selected_k: Optional[int]
    silhouette_score: Optional[float]
    inertia: Optional[float]
    n_training_users: Optional[int]
    cluster_balance: Optional[List[int]]
    k_evaluation: Optional[List[KEvalPoint]]
    pipeline_path: str
    artifact_exists: bool
