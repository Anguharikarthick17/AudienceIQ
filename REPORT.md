# AudienceIQ — Technical Report

## Problem Understanding

OTT (Over-The-Top) streaming platforms accumulate rich behavioral data about their viewers but often lack explainable, transparent audience segmentation tools. Generic recommendation engines operate as black boxes that cannot justify their outputs to product teams or viewers. This project addresses that gap by building an **Explainable Audience Intelligence Platform** that:

- Discovers audience segments through unsupervised clustering
- Names segments based on actual observed behavior (not arbitrary labels)
- Explains every classification decision with traceable reasoning
- Generates rule-based recommendations with explicit rationales
- Exposes all ML evidence transparently in the UI and API

---

## Assumptions

1. The dataset is OTT behavioral data in CSV format. Column names may vary across providers.
2. The problem is **unsupervised** — no pre-existing audience labels or ground truth are available.
3. One row per user (or deduplicated to one row per user ID before clustering).
4. Behavioral signals (watch time, session duration, genre preference, etc.) are more informative than demographic signals for personalization.
5. "Explainable" means traceable to data — not just attention weights or feature importance scores, but human-readable behavioral rationale.

---

## Dataset Description

The system accepts **any OTT-style CSV** without requiring a fixed schema. Column detection is heuristic (regex-based pattern matching against common OTT field naming conventions).

### Supported field categories (auto-detected):
| Category | Example Column Names |
|---|---|
| Watch Time | `watch_time_hours`, `total_minutes_watched`, `view_time` |
| Session Duration | `avg_session_duration_mins`, `session_length`, `avg_session_mins` |
| Session Count | `sessions_per_week`, `num_sessions`, `session_count` |
| Genre | `genre_list`, `top_genre`, `preferred_genre`, `content_category` |
| Completion Rate | `completion_rate`, `watch_rate`, `percent_watched` |
| Recency | `days_since_last_watch`, `last_active`, `recency` |
| Activity Pattern | `weekday_ratio`, `weekend_activity`, `peak_hour` |

### Demo / Synthetic Dataset
When no real dataset is provided, the trainer generates a realistic synthetic dataset with 2,000 users across 4 behavioral archetypes:
- **Heavy viewers** (25%): 100–150h watch time, 80–110m sessions
- **Moderate viewers** (35%): 30–60h watch time, 30–60m sessions  
- **Casual viewers** (25%): 5–15h watch time, 10–30m sessions
- **Binge viewers** (15%): 60–100h watch time, 120–180m sessions

---

## Preprocessing

1. **Deduplication**: Rows with the same user ID are deduplicated (first record retained)
2. **Numeric coercion**: `pd.to_numeric(errors='coerce')` applied to all behavioral columns
3. **Negative value clipping**: Watch time, session duration, session count clipped to [0, ∞)
4. **Completion rate normalization**: Values > 1.0 assumed to be percentages → divided by 100
5. **Missing value imputation**: Median imputation for numeric features; zeros for genre flags
6. **Genre parsing**: Multi-hot encoding with `|`, `,`, `;`, `/` delimiters supported
7. **Zero-variance column removal**: Columns with identical values across all users removed
8. **StandardScaler**: Applied in the sklearn Pipeline before KMeans

---

## Feature Selection Rationale

Behavioral features were chosen because they capture **how users engage** with content, not just what they watch:

| Feature | Why Selected |
|---|---|
| Watch time | Primary engagement signal — correlates with loyalty |
| Session duration | Reveals viewing style (binge vs. casual) |
| Session frequency | Reveals usage habit intensity |
| Genre preferences | Reveals content affinity for personalization |
| Completion rate | Reveals content-match quality and commitment level |
| Recency | Reveals churn risk and re-engagement opportunity |
| Activity patterns | Reveals viewing context (weekday/weekend, time of day) |

Features are engineered into a compact per-user behavioral vector. No demographic features (age, location, subscription tier) are required or assumed.

---

## Model Choice

**Algorithm**: KMeans Clustering  
**Rationale**:
- Unsupervised — no labeled training data required
- Interpretable cluster centroids (feature means per cluster)
- Scalable to millions of users
- Deterministic with fixed random seed
- Compatible with sklearn Pipeline for clean persistence

**Alternatives considered**:
- DBSCAN: Density-based, handles noise well, but poor on high-dimensional sparse data
- Hierarchical clustering: Better dendrograms but O(n²) complexity
- GMM: Soft assignments, but harder to explain to non-technical audiences

---

## Hyperparameters

| Parameter | Value | Rationale |
|---|---|---|
| `random_state` | 42 | Deterministic, reproducible results |
| `n_init` | 10 | Reduces sensitivity to centroid initialization |
| K range | [2, min(10, n_users//50)] | Prevents degenerate clusters on small datasets |
| Scaler | StandardScaler | Zero-mean, unit-variance normalization for KMeans convergence |

---

## K Selection Methodology

K is not hardcoded. The system evaluates every K in the valid range and selects the K that maximizes the **silhouette score**:

```
silhouette(i) = (b(i) - a(i)) / max(a(i), b(i))
```

Where:
- `a(i)` = mean distance from user i to all other users in its cluster
- `b(i)` = mean distance from user i to the nearest other cluster

Silhouette scores range from -1 to +1. Higher = better-defined clusters.

The inertia (elbow) curve is also computed and displayed in the frontend as a visual cross-reference.

---

## Cluster Profiles

Cluster profiles are computed from unscaled feature means, preserving interpretability. For each cluster:

- `avg_watch_time`: Mean total watch time in hours
- `avg_session_mins`: Mean session duration in minutes
- `avg_sessions`: Mean session frequency
- `avg_completion_rate`: Mean content completion rate
- `dominant_genres`: Genres with ≥20% mean multi-hot presence
- `audience_pct`: Percentage of total training users

---

## Segment Naming Logic

Segment names are **derived from observed centroid values**, not randomly assigned. The naming algorithm:

1. **Ranks clusters** by average watch time → relative tiers (High/Medium/Low engagement)
2. **Analyzes dominant genres** → maps to affinity groups (Action fans, Drama seekers, Genre Explorers, etc.)
3. **Inspects session duration** → adds Long/Mid/Short session qualifier
4. **Inspects completion rate** → identifies Binge Watchers and Samplers if applicable
5. **Composes compound name**: `{EngagementTier} {GenreLabel}` or specific behavioral description
6. **Deduplicates**: Appends Group suffix if names would collide

Example outputs (actual names depend on dataset):
- "High-Engagement Action & Thriller Fans"
- "Casual Short-Session Viewers"
- "Dedicated Drama & Story Seekers"
- "Genre Explorers"

---

## API Design

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Model readiness check (used by Docker healthcheck + evaluator) |
| `/upload` | POST | CSV upload with structural inspection |
| `/train` | POST | Trigger training on uploaded dataset |
| `/recommend` | POST | Segment assignment + recommendations (hackathon required) |
| `/analyze` | POST | Full per-user analysis with explanation |
| `/dashboard` | GET | Aggregate analytics metrics |
| `/segments` | GET | All segment profiles |
| `/segments/{id}` | GET | Single segment detail |
| `/model-info` | GET | ML evidence (K, scores, artifact status) |

**Validation applied to `/recommend`**:
- Positive watch time (0 < x ≤ 8,760h)
- Non-empty genre list
- Valid session duration (0.1 ≤ x ≤ 1,440m)
- Type validation (strings rejected for numeric fields)
- No stack traces exposed to clients

---

## Docker Architecture

```
docker compose up --build
     │
     ├─ trainer   → runs once → writes /models/{pipeline.joblib, metadata.json, cluster_profiles.json}
     │
     ├─ api       → reads /models → serves FastAPI on :8000
     │              depends_on: trainer (service_completed_successfully)
     │              healthcheck: GET /health every 10s
     │
     ├─ evaluator → waits for api health → runs test suite → writes /models/metrics.json
     │              depends_on: api (service_healthy)
     │
     └─ frontend  → Nginx serving React build on :80
                    proxies /api/* → api:8000
                    depends_on: api (service_healthy)
```

**Shared volumes**:
- `models_volume`: Pipeline artifacts shared between trainer, api, evaluator
- `data_volume`: Dataset storage shared between trainer and api

---

## Evaluation Methodology

The independent evaluator service (`evaluator/evaluate.py`) tests the live API with:

| Test Category | Count | Description |
|---|---|---|
| Health checks | 2 | Status ok + model_loaded=True |
| Valid requests | 4 | Various engagement profiles |
| Missing fields | 3 | Missing user_id, genres, watch_time |
| Invalid values | 3 | Negative, zero, wrong type |
| Edge cases | 4 | Max value, very large, unknown genres, minimum |
| Other endpoints | 3 | Dashboard, segments, model-info |
| **Total** | **19+** | |

Metrics collected: total tests, pass count, fail count, pass rate (%), average/min/max response time.

All metrics are computed from live API responses — nothing is fabricated.

---

## Results

> ⚠️ Actual results will be populated after training on the real hackathon dataset.

For the synthetic demo dataset (2,000 users):
- **K selected**: Determined by silhouette score (typically 3–5 for 4 archetypes)
- **Silhouette score**: Reported post-training in `/model-info`
- **Evaluator pass rate**: Target ≥ 90% (17/19+ tests)
- **API response time**: Typically < 50ms per inference

---

## Edge Cases Handled

| Case | Handling |
|---|---|
| No dataset uploaded | Trainer uses synthetic demo data |
| Missing values | Median imputation for numeric, 0 for genre flags |
| Unknown genres in inference | Default 0 for multi-hot encoding |
| Zero-variance features | Dropped before training |
| K > n_users | K range capped at n_users // 50 |
| Negative watch time | Rejected by Pydantic validator (422) |
| Empty genre list | Rejected by Pydantic validator (422) |
| Very large watch time (>8760h) | Rejected by Pydantic validator (422) |
| Stack traces in responses | Caught by global exception handler, never exposed |
| Dataset too small (<10 rows) | Training aborted with informative error |
| Duplicate rows | Dropped during feature engineering |
| Multiple genre columns | Merged with union across columns per user |

---

## Limitations

1. **Single-snapshot clustering**: Currently models a single behavioral snapshot per user. Temporal behavioral drift is not captured.
2. **Genre encoding**: If the dataset uses non-English or highly custom genre names, heuristic normalization may fail; the system falls back to top-N by frequency.
3. **KMeans assumes spherical clusters**: Non-spherical cluster shapes may produce suboptimal results vs. GMM or DBSCAN.
4. **No A/B test validation**: Recommendations are rule-based; their effectiveness is not validated against actual engagement lift.
5. **Scaler fitted on training data**: If inference data has very different scale than training data, predictions may drift.

---

## Future Improvements

1. **Temporal behavioral analysis**: If the dataset includes timestamps or repeated session records, add time-windowed engagement trend detection (weekly/monthly drift tracking).
2. **UMAP visualization**: Project high-dimensional feature space to 2D for visual cluster exploration.
3. **Alternative clustering**: Add DBSCAN or GMM as experimental options, selectable via API parameter.
4. **Online model updates**: Incremental clustering updates as new data arrives without full retraining.
5. **A/B testing framework**: Measure recommendation effectiveness through controlled experiments.
6. **Content catalog integration**: Replace generic recommendation strings with actual content titles from a catalog API.

---

## Reproducibility Instructions

```bash
# Prerequisites: Docker + Docker Compose

# Clone / enter project
cd AudienceIQ

# (Optional) Place real dataset
cp /path/to/ott_dataset.csv data/dataset.csv

# Build and run all services
docker compose up --build

# Access:
# Frontend:  http://localhost:80
# API docs:  http://localhost:8000/docs
# Health:    http://localhost:8000/health

# After startup, check evaluator metrics:
docker compose logs evaluator
cat models/metrics.json  # (if volume is mounted)
```

---

## Development Decisions

| Decision | Rationale |
|---|---|
| FastAPI over Flask | Async support, automatic OpenAPI docs, built-in Pydantic validation |
| Pydantic v2 | Faster validation, better error messages |
| joblib for persistence | sklearn's recommended serialization format |
| StandardScaler in Pipeline | Prevents data leakage — scaler fitted only on training data |
| Non-root Docker containers | Security best practice |
| Shared volume (not network transfer) | Avoids serialization overhead for large model files |
| Nginx for frontend | Production-grade SPA serving with proxy support |
| Silhouette over elbow | Elbow method is subjective; silhouette provides a quantitative optimum |
| Rule-based recommendations | Fully traceable, no LLM cost, works offline, explainable to stakeholders |
