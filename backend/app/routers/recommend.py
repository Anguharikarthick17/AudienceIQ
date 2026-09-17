"""AudienceIQ — /recommend router"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.ml.explainer import _confidence_label
from app.ml.feature_eng import build_inference_vector
from app.ml.recommender import generate_recommendations
from app.ml.trainer import predict_segment
from app.models import RecommendRequest, RecommendResponse
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/recommend", response_model=RecommendResponse, tags=["Inference"])
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    Assign a user to an audience segment and return personalized recommendations.

    Input is validated for:
    - positive watch_time_hours
    - non-empty top_genres list
    - valid numeric ranges
    - no stack traces exposed
    """
    if not app_state.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not yet trained. Please upload a dataset and trigger training first.",
        )

    try:
        feature_names = app_state.get_feature_names()
        feature_vec = build_inference_vector(
            watch_time_hours=req.watch_time_hours,
            top_genres=req.top_genres,
            avg_session_mins=req.avg_session_mins,
            feature_columns=feature_names,
        )

        # Align columns to training schema
        for col in feature_names:
            if col not in feature_vec.columns:
                feature_vec[col] = 0.0
        feature_vec = feature_vec[feature_names]

        segment_id, distance = predict_segment(app_state.pipeline, feature_vec)
        segment_name = app_state.get_segment_name(segment_id)
        cluster_profile = app_state.get_cluster_profile(segment_id)

        engagement_level = _classify_engagement_simple(req.watch_time_hours, req.avg_session_mins)

        recs, _ = generate_recommendations(
            segment_id=segment_id,
            segment_name=segment_name,
            top_genres=req.top_genres,
            engagement_level=engagement_level,
            cluster_profile=cluster_profile,
            n=5,
        )

        explanation = (
            f"This viewer primarily watches {_fmt_genres(req.top_genres)} content, "
            f"has {engagement_level.lower()} engagement with {req.avg_session_mins:.0f}-minute sessions, "
            f"and was assigned to the \"{segment_name}\" segment "
            f"(centroid distance: {distance:.3f})."
        )

        return RecommendResponse(
            user_id=req.user_id,
            segment_id=segment_id,
            segment_name=segment_name,
            recommendations=recs,
            distance_to_centroid=distance,
            explanation=explanation,
            confidence=_confidence_label(distance),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error during /recommend for user_id=%s", req.user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during inference. Please check server logs.",
        )


def _classify_engagement_simple(watch_time: float, session_mins: float) -> str:
    score = 0
    if watch_time >= 50:
        score += 2
    elif watch_time >= 20:
        score += 1
    if session_mins >= 60:
        score += 2
    elif session_mins >= 30:
        score += 1
    if score >= 3:
        return "High"
    elif score >= 2:
        return "Medium"
    return "Low"


def _fmt_genres(genres: list) -> str:
    if not genres:
        return "mixed"
    if len(genres) == 1:
        return genres[0]
    return f"{', '.join(genres[:-1])} and {genres[-1]}"
