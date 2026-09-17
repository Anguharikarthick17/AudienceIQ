"""AudienceIQ — /analyze router"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.ml.explainer import explain_assignment
from app.ml.feature_eng import build_inference_vector
from app.ml.recommender import generate_recommendations
from app.ml.trainer import predict_segment
from app.models import AnalyzeRequest, AnalyzeResponse
from app.state import app_state

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse, tags=["Inference"])
async def analyze_user(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Full per-user analysis:
    Profile → Behavior Analysis → Audience Segment → Why This Segment?
    → Recommendations → Why These Recommendations?
    """
    if not app_state.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not yet trained.",
        )

    try:
        feature_names = app_state.get_feature_names()
        feature_vec = build_inference_vector(
            watch_time_hours=req.watch_time_hours,
            top_genres=req.top_genres,
            avg_session_mins=req.avg_session_mins,
            sessions_per_week=req.sessions_per_week,
            completion_rate=req.completion_rate,
            feature_columns=feature_names,
        )

        for col in feature_names:
            if col not in feature_vec.columns:
                feature_vec[col] = 0.0
        feature_vec = feature_vec[feature_names]

        segment_id, distance = predict_segment(app_state.pipeline, feature_vec)
        segment_name = app_state.get_segment_name(segment_id)
        cluster_profile = app_state.get_cluster_profile(segment_id)

        explanation_result = explain_assignment(
            user_id=req.user_id,
            segment_id=segment_id,
            segment_name=segment_name,
            watch_time_hours=req.watch_time_hours,
            avg_session_mins=req.avg_session_mins,
            top_genres=req.top_genres,
            distance_to_centroid=distance,
            cluster_profile=cluster_profile,
            sessions_per_week=req.sessions_per_week,
            completion_rate=req.completion_rate,
        )

        recs, rationales = generate_recommendations(
            segment_id=segment_id,
            segment_name=segment_name,
            top_genres=req.top_genres,
            engagement_level=explanation_result["engagement_level"],
            cluster_profile=cluster_profile,
            n=5,
        )

        return AnalyzeResponse(
            user_id=req.user_id,
            segment_id=segment_id,
            segment_name=segment_name,
            audience_pct=cluster_profile.get("audience_pct", 0.0),
            engagement_level=explanation_result["engagement_level"],
            dominant_content=req.top_genres[:3],
            behavior_signals=explanation_result["behavior_signals"],
            segment_explanation=explanation_result["explanation"],
            recommendations=recs,
            recommendation_rationales=rationales,
            distance_to_centroid=distance,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error during /analyze for user_id=%s", req.user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error during analysis.",
        )
