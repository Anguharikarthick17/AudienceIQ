"""AudienceIQ — /dashboard router"""
from __future__ import annotations

import logging
from collections import Counter
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.ml.recommender import segment_recommendation_strategy
from app.models import DashboardResponse, SegmentSummary
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/dashboard", response_model=DashboardResponse, tags=["Analytics"])
async def dashboard() -> DashboardResponse:
    """Aggregate metrics for the main analytics dashboard."""
    meta = app_state.metadata
    profiles = app_state.cluster_profiles

    if not app_state.is_ready or not meta or not profiles:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not yet trained. Please upload a dataset and trigger training.",
        )

    total_viewers = meta.get("n_training_users", 0)
    n_clusters = meta.get("n_clusters", 0)
    sil_score = meta.get("silhouette_score", 0.0)
    inertia = meta.get("inertia", 0.0)

    # Aggregate watch time and session duration across all clusters (weighted)
    total_wt_sum = sum(
        p.get("avg_watch_time", 0) * p.get("user_count", 0) for p in profiles.values()
    )
    total_sd_sum = sum(
        p.get("avg_session_mins", 0) * p.get("user_count", 0) for p in profiles.values()
    )
    avg_watch_time = round(total_wt_sum / total_viewers, 3) if total_viewers else 0.0
    avg_session_mins = round(total_sd_sum / total_viewers, 3) if total_viewers else 0.0

    # Genre distribution
    genre_counter: Counter = Counter()
    for profile in profiles.values():
        genres = profile.get("dominant_genres", [])
        n_users = profile.get("user_count", 0)
        for g in genres:
            genre_counter[g] += n_users

    # Segments
    segments: List[SegmentSummary] = []
    for cid, profile in sorted(profiles.items()):
        seg_name = profile.get("segment_name", f"Segment {cid}")
        engagement = _engagement_from_profile(profile)
        segments.append(SegmentSummary(
            segment_id=cid,
            segment_name=seg_name,
            user_count=profile.get("user_count", 0),
            audience_pct=profile.get("audience_pct", 0.0),
            avg_watch_time=profile.get("avg_watch_time", 0.0),
            avg_session_mins=profile.get("avg_session_mins", 0.0),
            dominant_genres=profile.get("dominant_genres", []),
            engagement_level=engagement,
        ))

    return DashboardResponse(
        total_viewers=total_viewers,
        n_segments=n_clusters,
        avg_watch_time=avg_watch_time,
        avg_session_mins=avg_session_mins,
        silhouette_score=sil_score,
        inertia=inertia,
        segments=segments,
        genre_distribution=dict(genre_counter.most_common(15)),
        dataset_quality=app_state.dataset_quality,
        model_status="trained",
    )


def _engagement_from_profile(profile: dict) -> str:
    wt = profile.get("avg_watch_time", 0)
    sd = profile.get("avg_session_mins", 0)
    score = 0
    if wt >= 50:
        score += 2
    elif wt >= 20:
        score += 1
    if sd >= 60:
        score += 2
    elif sd >= 30:
        score += 1
    if score >= 3:
        return "High"
    elif score >= 2:
        return "Medium"
    return "Low"
