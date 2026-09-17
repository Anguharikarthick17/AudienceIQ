"""
AudienceIQ — Pydantic Schemas for Advanced Intelligence Lab
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Common Profile Input Schema
# ---------------------------------------------------------------------------
class ProfileInput(BaseModel):
    watch_time_hours: float = Field(..., ge=0.01, le=8760.0)
    avg_session_mins: float = Field(..., ge=0.1, le=1440.0)
    top_genres: List[str] = Field(..., min_length=1, max_length=20)
    sessions_per_week: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    completion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    days_since_last_watch: Optional[float] = Field(default=None, ge=0.0, le=365.0)
    weekend_activity_ratio: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @field_validator("top_genres")
    @classmethod
    def genres_not_empty(cls, v: List[str]) -> List[str]:
        cleaned = [g.strip() for g in v if g and g.strip()]
        if not cleaned:
            raise ValueError("top_genres must contain at least one valid genre string")
        return cleaned


# ---------------------------------------------------------------------------
# Feature 1: Counterfactual Lab Schemas
# ---------------------------------------------------------------------------
class CounterfactualRequest(BaseModel):
    original_profile: ProfileInput
    counterfactual_profile: ProfileInput


class ProfileResult(BaseModel):
    segment_id: int
    segment_name: str
    distance_to_centroid: float
    all_distances: Dict[int, float]
    feature_summary: Dict[str, float]


class FeatureDelta(BaseModel):
    feature_name: str
    display_name: str
    original_value: float
    counterfactual_value: float
    delta: float
    pull_towards_target_centroid: float


class SegmentTransition(BaseModel):
    source_segment_id: int
    source_segment_name: str
    target_segment_id: int
    target_segment_name: str
    changed: bool


class CounterfactualResponse(BaseModel):
    classification: str
    original: ProfileResult
    counterfactual: ProfileResult
    changed_features: List[FeatureDelta]
    segment_transition: SegmentTransition
    explanation: str
    disclaimer: str


# ---------------------------------------------------------------------------
# Feature 2: Audience Contradiction Detector Schemas
# ---------------------------------------------------------------------------
class ContradictionRequest(BaseModel):
    profile: ProfileInput
    baseline_profile: Optional[ProfileInput] = None


class ContradictionItem(BaseModel):
    rule_id: str
    title: str
    affected_features: List[str]
    observed_values: Dict[str, Any]
    expected_relationship: str
    explanation: str
    severity: str  # "LOW", "MEDIUM", "HIGH"


class ContradictionResponse(BaseModel):
    contradictions_detected: bool
    total_contradictions: int
    items: List[ContradictionItem]
    mode: str
    label: str
    data_classification: str
    disclaimer: str


# ---------------------------------------------------------------------------
# Feature 3: Audience Migration Map Schemas
# ---------------------------------------------------------------------------
class MigrationPathway(BaseModel):
    source_segment_id: int
    source_segment_name: str
    target_segment_id: int
    target_segment_name: str
    transition_type: str
    simulated_users_count: int
    simulated_transition_rate: float
    feature_shifts: Dict[str, float]
    original_distance: float
    new_distance: float
    explanation: str


class MigrationResponse(BaseModel):
    temporal_data_available: bool
    mode: str
    data_limitation_notice: str
    badge: str
    cohorts: List[Dict[str, Any]]
    pathways: List[MigrationPathway]


# ---------------------------------------------------------------------------
# Feature 4: Content Gaps Schemas
# ---------------------------------------------------------------------------
class GenreGapMetric(BaseModel):
    genre: str
    audience_demand_count: int
    audience_demand_share_pct: float
    catalog_count: int
    catalog_share_pct: float
    demand_coverage_gap_pct: float
    gap_status: str  # "DEFICIT", "BALANCED", "SURPLUS"
    is_critical_gap: bool
    sample_titles: List[str]


class ContentGapsResponse(BaseModel):
    total_viewers_analyzed: int
    total_catalog_titles: int
    exposure_measured: bool
    data_honesty_statement: str
    classification_map: Dict[str, str]
    genre_gaps: List[GenreGapMetric]
    top_gap_genres: List[str]
    why_this_gap_matters: str


# ---------------------------------------------------------------------------
# Feature 5: Why-Not Recommendation Engine Schemas
# ---------------------------------------------------------------------------
class ExplainRecommendationRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    watch_time_hours: float = Field(..., ge=0.01, le=8760.0)
    avg_session_mins: float = Field(..., ge=0.1, le=1440.0)
    top_genres: List[str] = Field(..., min_length=1, max_length=20)
    sessions_per_week: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    completion_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @field_validator("top_genres")
    @classmethod
    def genres_not_empty(cls, v: List[str]) -> List[str]:
        cleaned = [g.strip() for g in v if g and g.strip()]
        if not cleaned:
            raise ValueError("top_genres must contain at least one non-empty genre")
        return cleaned


class ScoredRecommendation(BaseModel):
    title: str
    genre: str
    status: str  # "RECOMMENDED" | "NOT_PRIORITIZED"
    score: float
    rating_stars: int
    segment_compatibility: float
    genre_compatibility: float
    behavior_compatibility: float
    reasons: List[str]


class ExplainRecommendationResponse(BaseModel):
    user_id: str
    segment_id: int
    segment_name: str
    confidence: str
    distance_to_centroid: float
    recommended_items: List[ScoredRecommendation]
    not_prioritized_items: List[ScoredRecommendation]
    scoring_framework: Dict[str, Any]
