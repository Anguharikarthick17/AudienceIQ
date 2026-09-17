"""
AudienceIQ — Dataset Inspector

Heuristically detects behavioral feature columns from any OTT-style CSV
without requiring fixed column names.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from app.models import ColumnProfile, DatasetQuality, DetectedFeatures


# ---------------------------------------------------------------------------
# Keyword patterns for heuristic detection
# ---------------------------------------------------------------------------
_WATCH_TIME_PATTERNS = re.compile(
    r"watch.?time|view.?time|total.?hours|hours.?watched|content.?hours|"
    r"minutes.?watched|total.?minutes|play.?time|playtime",
    re.IGNORECASE,
)
_SESSION_DUR_PATTERNS = re.compile(
    r"session.?dur|avg.?session|average.?session|session.?length|"
    r"session.?time|session.?mins|session.?minutes|session.?hours",
    re.IGNORECASE,
)
_SESSION_CNT_PATTERNS = re.compile(
    r"session.?count|num.?session|number.?session|sessions.?per|"
    r"frequency|n.?sessions|visit.?count|login.?count",
    re.IGNORECASE,
)
_GENRE_PATTERNS = re.compile(
    r"genre|category|content.?type|preferred.?genre|top.?genre|"
    r"fav.?genre|content.?category",
    re.IGNORECASE,
)
_COMPLETION_PATTERNS = re.compile(
    r"completion|watch.?rate|finish.?rate|completion.?rate|"
    r"percent.?watched|pct.?watched",
    re.IGNORECASE,
)
_RECENCY_PATTERNS = re.compile(
    r"recency|last.?watch|days.?since|last.?login|last.?active|"
    r"last.?session|days.?inactive",
    re.IGNORECASE,
)
_ACTIVITY_PATTERNS = re.compile(
    r"weekday|weekend|morning|evening|night|prime.?time|"
    r"peak.?hour|active.?hour|day.?of.?week",
    re.IGNORECASE,
)
_USER_ID_PATTERNS = re.compile(
    r"^user.?id$|^uid$|^userid$|^customer.?id$|^subscriber.?id$|"
    r"^member.?id$|^account.?id$|^profile.?id$|^id$",
    re.IGNORECASE,
)


def _col_matches(col: str, pattern: re.Pattern) -> bool:
    return bool(pattern.search(col))


def inspect_dataset(df: pd.DataFrame, filename: str = "dataset.csv") -> Dict[str, Any]:
    """
    Perform a full structural inspection of the uploaded DataFrame.

    Returns a dict with keys:
        quality        -> DatasetQuality
        columns        -> List[ColumnProfile]
        detected       -> DetectedFeatures
    """
    total_rows, total_cols = df.shape

    # ---- duplicates ----------------------------------------------------------
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round(duplicate_rows / total_rows * 100, 2) if total_rows else 0.0

    # ---- missing cells -------------------------------------------------------
    missing_cells = int(df.isnull().sum().sum())
    missing_cell_pct = round(missing_cells / (total_rows * total_cols) * 100, 2) if (total_rows * total_cols) else 0.0

    # ---- column profiles -----------------------------------------------------
    numeric_cols: List[str] = []
    categorical_cols: List[str] = []
    column_profiles: List[ColumnProfile] = []

    for col in df.columns:
        series = df[col]
        dtype_str = str(series.dtype)
        missing_count = int(series.isnull().sum())
        missing_pct = round(missing_count / total_rows * 100, 2) if total_rows else 0.0
        unique_count = int(series.nunique(dropna=True))

        # sample values (max 5, serializable)
        non_null = series.dropna()
        sample_raw = non_null.head(5).tolist()
        sample_values: List[Any] = []
        for v in sample_raw:
            if isinstance(v, (np.integer,)):
                sample_values.append(int(v))
            elif isinstance(v, (np.floating,)):
                sample_values.append(round(float(v), 4))
            else:
                sample_values.append(str(v))

        column_profiles.append(
            ColumnProfile(
                name=col,
                dtype=dtype_str,
                missing_count=missing_count,
                missing_pct=missing_pct,
                unique_count=unique_count,
                sample_values=sample_values,
            )
        )

        if pd.api.types.is_numeric_dtype(series):
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)

    # ---- heuristic feature detection -----------------------------------------
    user_id_col: Optional[str] = None
    watch_time_cols: List[str] = []
    session_duration_cols: List[str] = []
    session_count_cols: List[str] = []
    genre_cols: List[str] = []
    completion_cols: List[str] = []
    recency_cols: List[str] = []
    activity_pattern_cols: List[str] = []
    unrecognized_numeric: List[str] = []
    unrecognized_categorical: List[str] = []

    recognized: set = set()

    for col in df.columns:
        matched = False

        # user ID (prefer first match; must be high-cardinality string or int)
        if user_id_col is None and _col_matches(col, _USER_ID_PATTERNS):
            user_id_col = col
            recognized.add(col)
            matched = True

        if _col_matches(col, _WATCH_TIME_PATTERNS) and col in numeric_cols:
            watch_time_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _SESSION_DUR_PATTERNS) and col in numeric_cols:
            session_duration_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _SESSION_CNT_PATTERNS) and col in numeric_cols:
            session_count_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _GENRE_PATTERNS):
            genre_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _COMPLETION_PATTERNS) and col in numeric_cols:
            completion_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _RECENCY_PATTERNS) and col in numeric_cols:
            recency_cols.append(col)
            recognized.add(col)
            matched = True

        if _col_matches(col, _ACTIVITY_PATTERNS):
            activity_pattern_cols.append(col)
            recognized.add(col)
            matched = True

        if not matched and col != user_id_col:
            if col in numeric_cols:
                unrecognized_numeric.append(col)
            else:
                unrecognized_categorical.append(col)

    # ---- dataset quality warnings --------------------------------------------
    warnings: List[str] = []
    usable_behavioral = (
        len(watch_time_cols)
        + len(session_duration_cols)
        + len(session_count_cols)
        + len(genre_cols)
        + len(completion_cols)
        + len(recency_cols)
        + len(activity_pattern_cols)
    )

    if usable_behavioral == 0:
        warnings.append(
            "No recognized behavioral features detected. "
            "Will attempt to use all numeric columns as fallback."
        )
    if duplicate_rows > 0:
        warnings.append(f"{duplicate_rows} duplicate rows detected; will be dropped before training.")
    if missing_cell_pct > 30:
        warnings.append(f"High missing data ({missing_cell_pct:.1f}%). Imputation will be applied.")
    if total_rows < 100:
        warnings.append(f"Only {total_rows} rows — clustering results may be unstable.")
    if user_id_col is None:
        warnings.append("No user identifier column detected; rows will be indexed by position.")

    ready_to_train = usable_behavioral > 0 and total_rows >= 10

    quality = DatasetQuality(
        total_rows=total_rows,
        total_cols=total_cols,
        duplicate_rows=duplicate_rows,
        duplicate_pct=duplicate_pct,
        missing_cells=missing_cells,
        missing_cell_pct=missing_cell_pct,
        numeric_cols=len(numeric_cols),
        categorical_cols=len(categorical_cols),
        usable_behavioral_features=usable_behavioral,
        ready_to_train=ready_to_train,
        warnings=warnings,
    )

    detected = DetectedFeatures(
        user_id_col=user_id_col,
        watch_time_cols=watch_time_cols,
        session_duration_cols=session_duration_cols,
        session_count_cols=session_count_cols,
        genre_cols=genre_cols,
        completion_cols=completion_cols,
        recency_cols=recency_cols,
        activity_pattern_cols=activity_pattern_cols,
        unrecognized_numeric=unrecognized_numeric,
        unrecognized_categorical=unrecognized_categorical,
    )

    return {
        "quality": quality,
        "columns": column_profiles,
        "detected": detected,
    }
