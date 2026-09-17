"""
AudienceIQ — Rule-Based Recommender

Generates transparent, genre-aware content recommendations per segment.
No LLM, no black-box — every recommendation has an explicit rationale.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Genre → Content type recommendations
# ---------------------------------------------------------------------------
_GENRE_RECS: Dict[str, List[str]] = {
    "Action": [
        "Action-packed series with high-intensity storylines",
        "Blockbuster thrillers with strong narrative arcs",
        "Live-event sports programming",
    ],
    "Thriller": [
        "Psychological thriller mini-series",
        "Crime investigation documentaries",
        "Suspense-driven limited series",
    ],
    "Drama": [
        "Award-winning drama series",
        "Character-driven long-form stories",
        "Historical drama productions",
    ],
    "Comedy": [
        "Stand-up comedy specials",
        "Sitcom marathon collections",
        "Light-hearted family comedies",
    ],
    "Sci-Fi": [
        "Science fiction anthology series",
        "Space exploration documentaries",
        "Speculative future-world dramas",
    ],
    "Fantasy": [
        "Epic fantasy series with world-building",
        "Mythology and folklore adaptations",
        "Fantasy adventure films",
    ],
    "Documentary": [
        "In-depth documentary series",
        "Nature and wildlife films",
        "True crime investigations",
    ],
    "Horror": [
        "Horror anthology series",
        "Psychological horror films",
        "Supernatural thriller content",
    ],
    "Romance": [
        "Romantic drama series",
        "Feel-good love story films",
        "International romance productions",
    ],
    "Animation": [
        "Animated feature films",
        "Adult animation series",
        "Animated short film collections",
    ],
    "Crime": [
        "Crime procedural series",
        "True crime documentaries",
        "Police thriller dramas",
    ],
    "Sport": [
        "Live sports events and replays",
        "Sports biography documentaries",
        "Athlete profile series",
    ],
    "Kids": [
        "Age-appropriate animated series",
        "Educational content for children",
        "Family adventure films",
    ],
    "Music": [
        "Concert films and live performances",
        "Music biography documentaries",
        "Music competition reality shows",
    ],
    "Reality": [
        "Competitive reality shows",
        "Travel and lifestyle reality content",
        "Behind-the-scenes reality series",
    ],
    "News": [
        "Current affairs documentary series",
        "Investigative journalism specials",
        "Long-form news analysis content",
    ],
    "Mystery": [
        "Mystery thriller series",
        "Detective procedural dramas",
        "Cold-case documentary series",
    ],
    "Biography": [
        "Celebrity biography documentaries",
        "Historical figure biopics",
        "Athlete and leader profile films",
    ],
    "Adventure": [
        "Exploration and travel documentaries",
        "Outdoor adventure series",
        "Epic adventure films",
    ],
}

_DEFAULT_RECS = [
    "Popular titles trending across all genres",
    "Critically acclaimed new releases",
    "Editor's pick content collections",
]

_ENGAGEMENT_RECS: Dict[str, List[str]] = {
    "High": [
        "Exclusive first-look original content",
        "Long-form binge-worthy series (10+ episodes)",
        "Director's cut extended editions",
    ],
    "Medium": [
        "Weekend binge bundles (5–8 episode arcs)",
        "Curated thematic playlists",
        "Trending titles of the week",
    ],
    "Low": [
        "Short-form content (under 30 minutes)",
        "Highlight reel collections",
        "Top 10 most-watched this week",
    ],
}


def generate_recommendations(
    segment_id: int,
    segment_name: str,
    top_genres: List[str],
    engagement_level: str,
    cluster_profile: Dict[str, Any],
    n: int = 5,
) -> Tuple[List[str], List[str]]:
    """
    Generate content recommendations with rationales.

    Returns
    -------
    recommendations : List[str]
    rationales      : List[str]
    """
    recs: List[str] = []
    rationales: List[str] = []

    # ---- Genre-based recommendations (top 2 genres) ------------------------
    primary_genres = top_genres[:2] if top_genres else []
    for genre in primary_genres:
        genre_recs = _GENRE_RECS.get(genre, _DEFAULT_RECS)
        for rec in genre_recs[:2]:
            if rec not in recs:
                recs.append(rec)
                rationales.append(
                    f"Recommended because this viewer shows strong affinity for {genre} content"
                )

    # ---- Engagement-level recommendations ----------------------------------
    eng_recs = _ENGAGEMENT_RECS.get(engagement_level, _ENGAGEMENT_RECS["Medium"])
    for rec in eng_recs:
        if rec not in recs:
            recs.append(rec)
            rationales.append(
                f"Recommended based on {engagement_level.lower()} engagement pattern "
                f"(segment: {segment_name})"
            )

    # ---- Segment-specific strategy -----------------------------------------
    segment_rec = _segment_strategy_rec(segment_name)
    if segment_rec and segment_rec not in recs:
        recs.append(segment_rec)
        rationales.append(
            f"Tailored to behavioral profile of the \"{segment_name}\" audience segment"
        )

    # ---- Trim to n ----------------------------------------------------------
    return recs[:n], rationales[:n]


def _segment_strategy_rec(segment_name: str) -> Optional[str]:
    """Map segment name keywords to a strategic recommendation."""
    name_lower = segment_name.lower()

    if "binge" in name_lower:
        return "New season drops — first-episode preview access"
    if "high-engagement" in name_lower or "high engagement" in name_lower:
        return "Exclusive premium originals — early access queue"
    if "casual" in name_lower or "short-session" in name_lower:
        return "Quick-watch playlist: 20-minute episodes"
    if "genre explorer" in name_lower:
        return "Cross-genre discovery bundle — curated surprises"
    if "low-activity" in name_lower:
        return "Re-engagement highlights: What you missed this month"
    if "drama" in name_lower or "story" in name_lower:
        return "Long-form prestige drama: complete series collection"
    if "action" in name_lower or "thriller" in name_lower:
        return "Action marathon bundle — back-to-back blockbusters"

    return "Personalized weekly watch list based on your viewing history"


def segment_recommendation_strategy(segment_name: str, engagement_level: str) -> str:
    """One-sentence recommendation strategy description for a segment."""
    strategies = {
        "High": "Push exclusive originals, early access, and long-form series to maximize retention.",
        "Medium": "Curate thematic playlists and trending content to drive deeper exploration.",
        "Low": "Re-engage with short-form content, highlights, and low-commitment recommendations.",
    }
    base = strategies.get(engagement_level, strategies["Medium"])
    return f"{base} Optimized for the '{segment_name}' audience profile."
