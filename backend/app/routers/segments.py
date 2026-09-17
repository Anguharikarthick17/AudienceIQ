"""AudienceIQ — /segments router"""
from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.ml.recommender import segment_recommendation_strategy
from app.models import SegmentDetail
from app.routers.dashboard import _engagement_from_profile
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/segments", response_model=List[SegmentDetail], tags=["Analytics"])
async def list_segments() -> List[SegmentDetail]:
    """Return all discovered audience segments with full behavioral profiles."""
    _require_model()
    return [_profile_to_detail(cid, p) for cid, p in sorted(app_state.cluster_profiles.items())]


@router.get("/segments/{segment_id}", response_model=SegmentDetail, tags=["Analytics"])
async def get_segment(segment_id: int) -> SegmentDetail:
    """Return a single segment's full profile."""
    _require_model()
    profile = app_state.cluster_profiles.get(segment_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment {segment_id} not found.",
        )
    return _profile_to_detail(segment_id, profile)


def _require_model() -> None:
    if not app_state.is_ready or not app_state.cluster_profiles:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not yet trained.",
        )


def _profile_to_detail(cid: int, profile: dict) -> SegmentDetail:
    seg_name = profile.get("segment_name", f"Segment {cid}")
    engagement = _engagement_from_profile(profile)
    strategy = segment_recommendation_strategy(seg_name, engagement)

    characteristics = _build_characteristics(profile, engagement)

    return SegmentDetail(
        segment_id=cid,
        segment_name=seg_name,
        user_count=profile.get("user_count", 0),
        audience_pct=profile.get("audience_pct", 0.0),
        avg_watch_time=profile.get("avg_watch_time", 0.0),
        avg_session_mins=profile.get("avg_session_mins", 0.0),
        dominant_genres=profile.get("dominant_genres", []),
        engagement_level=engagement,
        engagement_characteristics=characteristics,
        recommendation_strategy=strategy,
        behavioral_profile=_sanitize_profile(profile),
    )


def _build_characteristics(profile: dict, engagement: str) -> List[str]:
    chars = []
    wt = profile.get("avg_watch_time", 0)
    sd = profile.get("avg_session_mins", 0)
    comp = profile.get("avg_completion_rate")

    if wt >= 50:
        chars.append(f"Heavy viewer: {wt:.1f} hours average watch time")
    elif wt >= 20:
        chars.append(f"Moderate viewer: {wt:.1f} hours average watch time")
    else:
        chars.append(f"Light viewer: {wt:.1f} hours average watch time")

    if sd >= 60:
        chars.append(f"Long sessions: {sd:.0f} minutes average")
    elif sd >= 30:
        chars.append(f"Medium sessions: {sd:.0f} minutes average")
    elif sd > 0:
        chars.append(f"Short sessions: {sd:.0f} minutes average")

    if comp is not None:
        if comp >= 0.8:
            chars.append(f"High completion rate: {comp*100:.0f}% — committed viewers")
        elif comp >= 0.5:
            chars.append(f"Moderate completion rate: {comp*100:.0f}%")
        else:
            chars.append(f"Low completion rate: {comp*100:.0f}% — frequent samplers")

    chars.append(f"{engagement} engagement level audience")
    return chars


def _sanitize_profile(profile: dict) -> dict:
    """Return a clean version of the profile for frontend consumption."""
    safe = {
        "avg_watch_time": profile.get("avg_watch_time"),
        "avg_session_mins": profile.get("avg_session_mins"),
        "avg_sessions": profile.get("avg_sessions"),
        "avg_completion_rate": profile.get("avg_completion_rate"),
        "dominant_genres": profile.get("dominant_genres", []),
    }
    return {k: v for k, v in safe.items() if v is not None}
