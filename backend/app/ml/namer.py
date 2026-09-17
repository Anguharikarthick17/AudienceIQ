"""
AudienceIQ — Rule-Based Segment Namer

Analyzes cluster feature centroids and assigns descriptive,
human-readable segment names based on observed behavioral patterns.

Names are DERIVED from data — not randomly assigned.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Engagement level thresholds (in hours of watch time)
# ---------------------------------------------------------------------------
# These are relative — computed against cluster distribution


def name_segments(
    cluster_profiles: Dict[int, Dict[str, Any]],
    feature_names: List[str],
) -> Dict[int, str]:
    """
    Assign a meaningful name to each cluster based on its behavioral profile.

    Strategy:
    1. Rank clusters by watch time → label as High / Medium / Low engagement
    2. Inspect dominant genres → add content affinity label
    3. Inspect session duration → add session length label
    4. Inspect session frequency → add activity frequency label
    5. Combine into a compound name
    """
    names: Dict[int, str] = {}
    cluster_ids = sorted(cluster_profiles.keys())

    if not cluster_ids:
        return names

    # ---- Collect metrics across clusters for relative ranking ---------------
    wt_values = {cid: cluster_profiles[cid].get("avg_watch_time", 0.0) for cid in cluster_ids}
    sd_values = {cid: cluster_profiles[cid].get("avg_session_mins", 0.0) for cid in cluster_ids}
    sc_values = {cid: cluster_profiles[cid].get("avg_sessions", 0.0) for cid in cluster_ids}

    all_wt = sorted(wt_values.values())
    all_sd = sorted(sd_values.values())

    def _quantile_label(value: float, sorted_vals: List[float], labels: List[str]) -> str:
        n = len(sorted_vals)
        if n == 0:
            return labels[len(labels) // 2]
        q33 = sorted_vals[max(0, n // 3)]
        q67 = sorted_vals[min(n - 1, 2 * n // 3)]
        if value >= q67:
            return labels[-1]
        elif value >= q33:
            return labels[len(labels) // 2]
        else:
            return labels[0]

    for cid in cluster_ids:
        profile = cluster_profiles[cid]
        dominant_genres: List[str] = profile.get("dominant_genres", [])
        avg_wt = profile.get("avg_watch_time", 0.0)
        avg_sd = profile.get("avg_session_mins", 0.0)
        avg_comp = profile.get("avg_completion_rate")
        avg_sc = sc_values.get(cid, 0.0)

        # ---- Engagement level -----------------------------------------------
        engagement = _quantile_label(
            avg_wt, all_wt, ["Low-Activity", "Moderate", "High-Engagement"]
        )

        # ---- Session length label -------------------------------------------
        session_label = _quantile_label(
            avg_sd, all_sd, ["Short-Session", "Mid-Session", "Long-Session"]
        )

        # ---- Genre label ----------------------------------------------------
        genre_label = _genre_label(dominant_genres)

        # ---- Completion / binge behavior ------------------------------------
        binge_label = ""
        if avg_comp is not None:
            if avg_comp >= 0.85:
                binge_label = "Binge Watchers"
            elif avg_comp <= 0.35:
                binge_label = "Samplers"

        # ---- Compose name ---------------------------------------------------
        name = _compose_name(
            engagement=engagement,
            session_label=session_label,
            genre_label=genre_label,
            binge_label=binge_label,
            avg_wt=avg_wt,
            avg_sd=avg_sd,
        )

        names[cid] = name

    # ---- Ensure uniqueness --------------------------------------------------
    names = _deduplicate_names(names)

    return names


def _genre_label(dominant_genres: List[str]) -> str:
    """Convert a list of dominant genres into a compact label."""
    if not dominant_genres:
        return "Mixed Content"

    # Genre affinity groups
    action_set = {"Action", "Thriller", "Crime", "Adventure"}
    drama_set = {"Drama", "Romance", "Biography"}
    comedy_set = {"Comedy", "Animation", "Kids"}
    scifi_set = {"Sci-Fi", "Fantasy", "Mystery"}
    doc_set = {"Documentary", "News", "Sport", "Reality"}

    top2 = set(dominant_genres[:2])

    if top2 & action_set:
        if len(dominant_genres) >= 4:
            return "Genre Explorers"
        return "Action & Thriller Fans"
    if top2 & drama_set:
        return "Drama & Story Seekers"
    if top2 & comedy_set:
        return "Comedy & Light Content Fans"
    if top2 & scifi_set:
        return "Sci-Fi & Fantasy Enthusiasts"
    if top2 & doc_set:
        return "Factual Content Viewers"
    if len(dominant_genres) >= 4:
        return "Genre Explorers"

    return f"{dominant_genres[0]} Viewers"


def _compose_name(
    engagement: str,
    session_label: str,
    genre_label: str,
    binge_label: str,
    avg_wt: float,
    avg_sd: float,
) -> str:
    """Assemble a readable compound segment name."""
    if binge_label:
        return f"{engagement} {binge_label}"

    if engagement == "High-Engagement":
        return f"High-Engagement {genre_label}"
    elif engagement == "Low-Activity":
        if avg_sd < 20:
            return f"Casual {session_label} Viewers"
        return "Low-Activity Viewers"
    else:
        # Medium engagement
        if session_label == "Long-Session":
            return f"Dedicated {genre_label}"
        elif genre_label == "Genre Explorers":
            return "Genre Explorers"
        else:
            return f"Regular {genre_label}"


def _deduplicate_names(names: Dict[int, str]) -> Dict[int, str]:
    """Append a suffix to names that would otherwise be identical."""
    seen: Dict[str, int] = {}
    result: Dict[int, str] = {}
    for cid, name in sorted(names.items()):
        if name in seen:
            seen[name] += 1
            result[cid] = f"{name} (Group {seen[name]})"
        else:
            seen[name] = 1
            result[cid] = name
    return result
