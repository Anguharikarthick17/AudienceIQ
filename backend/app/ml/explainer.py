"""
AudienceIQ — Per-User Explainer

Generates human-readable explanations for a user's segment assignment.
No LLM — purely rule-based signal analysis.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.models import BehaviorSignal


def explain_assignment(
    user_id: str,
    segment_id: int,
    segment_name: str,
    watch_time_hours: float,
    avg_session_mins: float,
    top_genres: List[str],
    distance_to_centroid: float,
    cluster_profile: Dict[str, Any],
    sessions_per_week: Optional[float] = None,
    completion_rate: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Produce a structured explanation for why a user was assigned to a segment.

    Returns:
        engagement_level : str
        behavior_signals : List[BehaviorSignal]
        explanation      : str
    """
    # ---- Engagement level ---------------------------------------------------
    engagement_level = _classify_engagement(watch_time_hours, avg_session_mins)

    # ---- Behavior signals ---------------------------------------------------
    signals: List[BehaviorSignal] = []

    signals.append(BehaviorSignal(
        signal="Watch Time",
        value=f"{watch_time_hours:.1f} hours",
        interpretation=_wt_interpretation(watch_time_hours),
    ))

    signals.append(BehaviorSignal(
        signal="Average Session Duration",
        value=f"{avg_session_mins:.0f} minutes",
        interpretation=_session_interpretation(avg_session_mins),
    ))

    if top_genres:
        signals.append(BehaviorSignal(
            signal="Content Preferences",
            value=", ".join(top_genres[:3]),
            interpretation=f"Shows affinity for {' and '.join(top_genres[:2])} content",
        ))

    if sessions_per_week is not None:
        signals.append(BehaviorSignal(
            signal="Session Frequency",
            value=f"{sessions_per_week:.1f} sessions/week",
            interpretation=_frequency_interpretation(sessions_per_week),
        ))

    if completion_rate is not None:
        signals.append(BehaviorSignal(
            signal="Completion Rate",
            value=f"{completion_rate * 100:.0f}%",
            interpretation=_completion_interpretation(completion_rate),
        ))

    # Centroid proximity
    confidence = _confidence_label(distance_to_centroid)
    signals.append(BehaviorSignal(
        signal="Segment Match Confidence",
        value=confidence,
        interpretation=f"Distance to segment centroid: {distance_to_centroid:.3f}",
    ))

    # ---- Narrative explanation ----------------------------------------------
    genre_str = _genre_list_str(top_genres)
    explanation = (
        f"This viewer primarily watches {genre_str} content, "
        f"has {engagement_level.lower()} engagement, "
        f"and sessions averaging {avg_session_mins:.0f} minutes. "
        f"They were assigned to the \"{segment_name}\" segment "
        f"because their behavioral profile most closely matches "
        f"the {audience_pct_description(cluster_profile.get('audience_pct', 0))} "
        f"of the audience in that cluster "
        f"(centroid distance: {distance_to_centroid:.3f})."
    )

    return {
        "engagement_level": engagement_level,
        "behavior_signals": signals,
        "explanation": explanation,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _classify_engagement(watch_time: float, session_mins: float) -> str:
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
    else:
        return "Low"


def _wt_interpretation(hours: float) -> str:
    if hours >= 100:
        return "Very heavy viewer — top engagement tier"
    elif hours >= 50:
        return "Heavy viewer — above average engagement"
    elif hours >= 20:
        return "Moderate viewer — average engagement"
    elif hours >= 5:
        return "Light viewer — below average engagement"
    else:
        return "Minimal viewer — very low engagement"


def _session_interpretation(mins: float) -> str:
    if mins >= 90:
        return "Binge-watches content in long uninterrupted sessions"
    elif mins >= 45:
        return "Prefers extended viewing sessions"
    elif mins >= 20:
        return "Typical session length — moderate duration"
    else:
        return "Short viewing sessions — casual or browse behavior"


def _frequency_interpretation(sessions_per_week: float) -> str:
    if sessions_per_week >= 14:
        return "Daily+ active user — very high frequency"
    elif sessions_per_week >= 7:
        return "Daily viewer"
    elif sessions_per_week >= 3:
        return "Regular viewer — several times a week"
    elif sessions_per_week >= 1:
        return "Occasional viewer — about once a week"
    else:
        return "Infrequent viewer"


def _completion_interpretation(rate: float) -> str:
    if rate >= 0.9:
        return "Completes almost everything — very committed viewer"
    elif rate >= 0.7:
        return "Usually finishes content — engaged viewer"
    elif rate >= 0.4:
        return "Frequently abandons content mid-way"
    else:
        return "Rarely finishes content — browser/sampler behavior"


def _confidence_label(distance: float) -> str:
    if distance <= 0.5:
        return "High"
    elif distance <= 1.5:
        return "Medium"
    else:
        return "Low"


def _genre_list_str(genres: List[str]) -> str:
    if not genres:
        return "mixed"
    if len(genres) == 1:
        return genres[0]
    if len(genres) == 2:
        return f"{genres[0]} and {genres[1]}"
    return f"{', '.join(genres[:-1])}, and {genres[-1]}"


def audience_pct_description(pct: float) -> str:
    return f"{pct:.1f}%"
