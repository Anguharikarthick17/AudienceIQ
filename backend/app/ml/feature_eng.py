"""
AudienceIQ — Feature Engineering

Builds a compact, clean behavioral feature matrix from any OTT-style DataFrame
using the column mapping produced by inspector.py.
"""
from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer

from app.models import DetectedFeatures


# ---------------------------------------------------------------------------
# Known OTT genres for multi-hot encoding
# ---------------------------------------------------------------------------
KNOWN_GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy",
    "Crime", "Documentary", "Drama", "Fantasy", "Horror",
    "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller",
    "Western", "Reality", "News", "Kids", "Music",
]

_GENRE_NORMALIZE = {g.lower(): g for g in KNOWN_GENRES}


def _normalize_genre(raw: str) -> Optional[str]:
    """Map a raw genre string to a canonical form if known."""
    cleaned = raw.strip().lower()
    return _GENRE_NORMALIZE.get(cleaned, raw.strip() if raw.strip() else None)


def _parse_genre_cell(value) -> List[str]:
    """
    Parse a genre cell which may be:
    - A single string: "Action"
    - A comma/pipe/semicolon-separated string: "Action|Thriller"
    - Already a list (if df loaded from json)
    """
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return []
    if isinstance(value, list):
        items = value
    else:
        items = re.split(r"[|,;/]", str(value))
    genres = []
    for item in items:
        norm = _normalize_genre(item)
        if norm:
            genres.append(norm)
    return genres


def engineer_features(
    df: pd.DataFrame,
    detected: DetectedFeatures,
) -> Tuple[pd.DataFrame, pd.Index]:
    """
    Build a clean behavioral feature matrix.

    Returns
    -------
    feature_df : pd.DataFrame
        Rows = users, columns = engineered features (all numeric)
    user_index : pd.Index
        User identifiers aligned to feature_df rows
    """
    df = df.copy()

    # ---- 1. De-duplicate on user_id if available --------------------------
    if detected.user_id_col and detected.user_id_col in df.columns:
        df = df.drop_duplicates(subset=[detected.user_id_col])
        user_index = df[detected.user_id_col].reset_index(drop=True)
    else:
        df = df.drop_duplicates()
        user_index = pd.RangeIndex(len(df))

    df = df.reset_index(drop=True)

    features: Dict[str, pd.Series] = {}

    # ---- 2. Engagement features (watch time) ------------------------------
    for col in detected.watch_time_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        series = series.clip(lower=0)  # no negative watch time
        series = series.fillna(series.median() if series.notna().any() else 0.0)
        features[f"watch_time__{col}"] = series

    # If multiple watch-time cols exist, also create an aggregated sum
    if len(detected.watch_time_cols) > 1:
        wt_sum = sum(features[f"watch_time__{c}"] for c in detected.watch_time_cols)
        features["watch_time__total"] = wt_sum

    # ---- 3. Session features ----------------------------------------------
    for col in detected.session_duration_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        series = series.clip(lower=0)
        series = series.fillna(series.median() if series.notna().any() else 0.0)
        features[f"session_dur__{col}"] = series

    for col in detected.session_count_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        series = series.clip(lower=0)
        series = series.fillna(series.median() if series.notna().any() else 0.0)
        features[f"session_cnt__{col}"] = series

    # ---- 4. Completion / engagement rate ----------------------------------
    for col in detected.completion_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        series = series.clip(lower=0, upper=1 if series.max() <= 1.0 else 100)
        # Normalize to [0,1] if appears to be percentage
        if series.max() > 1.0:
            series = series / 100.0
        series = series.fillna(series.median() if series.notna().any() else 0.5)
        features[f"completion__{col}"] = series

    # ---- 5. Recency features ----------------------------------------------
    for col in detected.recency_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        series = series.clip(lower=0)
        series = series.fillna(series.median() if series.notna().any() else 0.0)
        features[f"recency__{col}"] = series

    # ---- 6. Activity pattern features -------------------------------------
    for col in detected.activity_pattern_cols:
        if df[col].dtype == object:
            # Ordinal encode: weekday=0/weekend=1 style heuristic
            mapping = _build_activity_mapping(df[col])
            features[f"activity__{col}"] = df[col].map(mapping).fillna(0.0)
        else:
            series = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
            features[f"activity__{col}"] = series

    # ---- 7. Genre multi-hot encoding --------------------------------------
    genre_matrix = None
    genre_cols_used: List[str] = []

    if detected.genre_cols:
        all_genre_lists: List[List[str]] = []
        for col in detected.genre_cols:
            parsed = df[col].apply(_parse_genre_cell)
            all_genre_lists.append(parsed)

        # Merge across multiple genre columns per row
        merged_genres = [
            list({g for lst in row_entries for g in lst})
            for row_entries in zip(*all_genre_lists)
        ]

        # Determine genres that actually appear in data
        all_seen: set = set()
        for gl in merged_genres:
            all_seen.update(gl)

        # Filter to known genres first; fallback to top-20 seen
        known_in_data = [g for g in KNOWN_GENRES if g in all_seen]
        if not known_in_data:
            # Dataset uses unknown genre names — use top N by frequency
            from collections import Counter
            freq = Counter(g for gl in merged_genres for g in gl)
            known_in_data = [g for g, _ in freq.most_common(20)]

        if known_in_data:
            mlb = MultiLabelBinarizer(classes=known_in_data)
            encoded = mlb.fit_transform(merged_genres)
            genre_matrix = pd.DataFrame(
                encoded, columns=[f"genre__{g}" for g in known_in_data]
            )
            genre_cols_used = list(genre_matrix.columns)

    # ---- 8. Fallback: use all unrecognized numeric cols -------------------
    all_behavioral_found = bool(features) or genre_matrix is not None

    if not all_behavioral_found:
        # No recognized behavioral features — fall back to all numeric columns
        for col in detected.unrecognized_numeric:
            series = pd.to_numeric(df[col], errors="coerce")
            series = series.fillna(series.median() if series.notna().any() else 0.0)
            features[f"numeric__{col}"] = series

    # ---- 9. Assemble feature DataFrame ------------------------------------
    feature_df = pd.DataFrame(features, index=df.index)

    if genre_matrix is not None:
        genre_matrix.index = df.index
        feature_df = pd.concat([feature_df, genre_matrix], axis=1)

    # ---- 10. Final sanity checks ------------------------------------------
    # Drop columns with zero variance (all-same value carries no info)
    zero_var_cols = feature_df.columns[feature_df.std() == 0].tolist()
    if zero_var_cols and len(feature_df.columns) > len(zero_var_cols):
        feature_df = feature_df.drop(columns=zero_var_cols)

    # Replace any remaining NaN/inf (defensive)
    feature_df = feature_df.replace([np.inf, -np.inf], np.nan)
    feature_df = feature_df.fillna(0.0)

    return feature_df, user_index


def _build_activity_mapping(series: pd.Series) -> Dict:
    """Build a simple ordinal mapping for categorical activity columns."""
    unique_vals = series.dropna().unique()
    mapping: Dict = {}
    for i, v in enumerate(sorted(unique_vals)):
        mapping[v] = float(i)
    return mapping


def build_inference_vector(
    watch_time_hours: float,
    top_genres: List[str],
    avg_session_mins: float,
    sessions_per_week: Optional[float] = None,
    completion_rate: Optional[float] = None,
    feature_columns: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Build a single-row feature DataFrame from the /recommend or /analyze request.
    Must produce the same columns that were used during training (passed via feature_columns).
    Unknown columns default to 0.
    """
    row: Dict[str, float] = {}

    # Map common API fields to expected feature column patterns
    for col in (feature_columns or []):
        if col.startswith("watch_time__"):
            row[col] = watch_time_hours
        elif col.startswith("session_dur__"):
            row[col] = avg_session_mins
        elif col.startswith("session_cnt__"):
            row[col] = sessions_per_week if sessions_per_week is not None else _estimate_sessions(watch_time_hours, avg_session_mins)
        elif col.startswith("completion__"):
            row[col] = completion_rate if completion_rate is not None else 0.7
        elif col.startswith("recency__"):
            row[col] = 0.0  # unknown recency → assume recent
        elif col.startswith("activity__"):
            row[col] = 0.0
        elif col.startswith("genre__"):
            genre_name = col.split("genre__", 1)[1]
            row[col] = 1.0 if genre_name in top_genres else 0.0
        elif col.startswith("numeric__"):
            row[col] = 0.0
        else:
            row[col] = 0.0

    return pd.DataFrame([row])


def _estimate_sessions(watch_time_hours: float, avg_session_mins: float) -> float:
    """Estimate weekly session count from watch time and session duration."""
    if avg_session_mins <= 0:
        return 0.0
    total_mins = watch_time_hours * 60
    sessions_total = total_mins / avg_session_mins
    return round(sessions_total / 4, 2)  # assume ~4 weeks of data
