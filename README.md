# AudienceIQ

> **Explainable OTT Audience Intelligence & Personalization Platform**

[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com)

---

## Quick Start

```bash
# Prerequisites: Docker + Docker Compose

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Architecture

```
Frontend (React+Vite+Tailwind) :80
    │ HTTP /api/*
    ▼
FastAPI (Python 3.12) :8000
    │ reads
    ▼
/models/pipeline.joblib   ← trained by trainer service
/models/metadata.json
/models/cluster_profiles.json
    ▲
trainer service (one-shot)
    │
evaluator service → /models/metrics.json
```

## Using a Real Dataset

Place your OTT CSV at `data/dataset.csv` before running:

```bash
mkdir -p data
cp /path/to/your_ott_dataset.csv data/dataset.csv
docker compose up --build
```

The system auto-detects behavioral columns. No schema changes needed.

Alternatively, use the **Dataset Upload** page in the frontend to upload after startup, then click "Train Model".

---

## API Reference

### GET /health
```json
{ "status": "ok", "model_loaded": true, "n_clusters": 4 }
```

### POST /recommend
```json
{
  "user_id": "USR-8192",
  "watch_time_hours": 32.5,
  "top_genres": ["Action", "Thriller"],
  "avg_session_mins": 85.0
}
```

Response:
```json
{
  "user_id": "USR-8192",
  "segment_id": 0,
  "segment_name": "High-Engagement Action & Thriller Fans",
  "recommendations": ["..."],
  "distance_to_centroid": 0.42,
  "explanation": "...",
  "confidence": "High"
}
```

### POST /analyze
Extended analysis with behavior signals and recommendation rationales.

### GET /dashboard
Aggregate metrics for all audience segments.

### GET /segments / GET /segments/{id}
Full segment profiles with behavioral characteristics.

---

## Five Advanced Intelligence Features (Team Liquid)

AudienceIQ features five differentiating advanced intelligence capabilities integrated into the platform, designed around the **Black × Yellow × Liquid Glass** design system and strictly reusing the existing persisted ML pipeline without retraining.

### 1. Counterfactual Lab (`POST /counterfactual`)
- **Purpose**: Interactive sensitivity analysis allowing operators to ask: *"What would happen to this audience profile if their behavior changed?"*
- **Inputs**: Baseline profile vs What-If counterfactual profile (watch time, session duration, sessions per week, completion rate, days since last watch, weekend activity ratio, audited genres).
- **Processing**: Both feature vectors pass through the exact same persisted `StandardScaler` + `KMeans` pipeline via `model_service.py`. Features are evaluated in the scaled feature space to quantify pull towards the counterfactual cluster centroid.
- **Outputs**:
  - Original vs Counterfactual segment assignments and centroid distances
  - Changed features comparison (`32h → 58h`, etc.)
  - Segment transition indicator (e.g. *Genre Explorers* → *High-Engagement Genre Explorers*)
  - Explicit mathematical attribution breakdown
  - Non-negotiable label: `COUNTERFACTUAL SIMULATION — NOT CAUSAL INFERENCE`
- **Data Classification**: `SIMULATED / COUNTERFACTUAL`

### 2. Audience Contradiction Detector (`POST /contradictions`)
- **Purpose**: Detects behavioral telemetry patterns that are internally inconsistent or departed from empirical OTT distribution patterns.
- **Inputs**: User telemetry profile or comparison between baseline and modified profile.
- **Processing**: Evaluates deterministic mathematical consistency rules derived from the 2,000-user distribution:
  - High watch time intensity (>70h) paired with micro-sessions (≤25m)
  - Substantial volume (>50h) with near-zero completion (≤15%)
  - Long session duration (≥90m) mathematically conflicting with low monthly watch time (≤8h)
  - High weekly frequency (≥7/wk) with prolonged inactivity (≥25 days)
  - High genre diversity (6+ genres) with insufficient consumption depth (≤5h)
- **Outputs**: Contradiction flag, affected features, observed telemetry, expected mathematical relationships, deterministic severity (`LOW`, `MEDIUM`, `HIGH`).
- **Data Classification**: `OBSERVED` (for static profiles), labeled as `Rule-based behavioral inconsistency indicator`. When in comparison mode: `Profile comparison — not historical behavior.`

### 3. Audience Migration Map (`GET /migration`)
- **Purpose**: Models viewer cohort mobility and engagement transition vectors between discovered audience segments.
- **Data Limitation Audit**: Inspection of `data/dataset.csv` confirmed the **complete absence of temporal timestamps, viewing dates, session logs, or longitudinal records**.
- **Automated Fallback**: Automatically activates **COUNTERFACTUAL AUDIENCE MIGRATION**. Does **not** fabricate temporal history.
- **Processing**: Calculates deterministic centroid boundary vectors between Cluster 0 (*High-Engagement Genre Explorers*) and Cluster 1 (*Genre Explorers*), evaluating required feature shifts and simulation transition rates.
- **Outputs**:
  - Interactive node-and-flow visualization with animated flow lines
  - Transition pathways (Escalation vs Decay)
  - Required feature deltas ($\Delta$ watch time, $\Delta$ session duration, $\Delta$ completion rate)
  - Prominent mandatory badge: `SIMULATED TRANSITION — NOT HISTORICAL MIGRATION`
- **Data Classification**: `SIMULATED / COUNTERFACTUAL`

### 4. Content–Audience Mismatch Detector / Content Gaps (`GET /content-gaps`)
- **Purpose**: Evaluates platform audience demand against catalog coverage to detect genre supply deficits.
- **Inputs**: Audited audience genre preferences from `data/dataset.csv` (2,000 users) vs available platform catalog titles across 19 genres (`_GENRE_RECS`).
- **Data Limitation Audit**: The dataset contains observed genre affinities but **no content exposure or impression telemetry**.
- **Data Honesty Declaration**: Explicitly discloses: *"Observed audience preference is compared with available catalog coverage; exposure is not measured in the supplied dataset."*
- **Processing**: Computes relative Audience Demand Share % vs Catalog Share %, calculating the Demand Coverage Gap %.
- **Outputs**:
  - Demand vs Catalog comparative visual bars
  - Critical gap indicator for genres with >3% supply deficit (e.g. Action, Comedy)
  - "Why This Gap Matters" analytical panel grounded in observed numbers
- **Data Classification**: Audience Demand = `OBSERVED`, Catalog Coverage = `OBSERVED`, Coverage Gap = `INFERRED`, User Exposure = `Not available in supplied dataset.`

### 5. Why-Not Recommendation Engine (`POST /recommend/explain`)
- **Purpose**: Fully explainable content ranking engine that provides dual rationales: why candidate items are prioritized and why alternative titles are deprioritized.
- **Inputs**: User ID, watch time, session duration, preferred genres.
- **Processing**: Deterministic scoring matrix combining Genre Compatibility (40%), Cohort Affinity (30%), and Behavioral Session Format (30%). Zero LLM, zero external black-box.
- **Outputs**:
  - **RECOMMENDED (★★★★★)**: Candidates scoring ≥65 with explicit checklist (`✓ Matches primary genre`, `✓ Dominant in cohort`, `✓ Formatted for session depth`)
  - **NOT PRIORITIZED (★★☆☆☆)**: Lower-scoring alternatives with explicit reasons (`○ Weaker genre alignment`, `○ Lower cohort affinity`, `○ Format mismatch`)
  - Transparent score breakdown (0–100) and star ratings
- **Data Classification**: `OBSERVED` / `INFERRED`


---

## ML Pipeline

1. **Inspect** → heuristic column detection (no fixed schema)
2. **Engineer** → watch time, session, genre, completion, recency, activity features
3. **Evaluate K** → silhouette score + inertia for K in [2, min(10, n_users//50)]
4. **Select K** → maximum silhouette score
5. **Train** → StandardScaler → KMeans(random_state=42)
6. **Profile** → cluster centroid analysis
7. **Name** → rule-based segment naming from actual behavioral data
8. **Persist** → pipeline.joblib + metadata.json + cluster_profiles.json

---

## Project Structure

```
AudienceIQ/
├── backend/        FastAPI app + ML modules
├── trainer/        One-shot training service
├── evaluator/      Independent API test suite
├── frontend/       React + Vite + Tailwind dashboard
├── docker-compose.yml
└── REPORT.md
```

---

## Evaluation Results

After `docker compose up --build`, check:
```bash
docker compose logs evaluator
```

Metrics written to `/models/metrics.json` (inside Docker volume).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python 3.12, FastAPI, Pydantic v2 |
| ML | scikit-learn (KMeans, StandardScaler, silhouette_score), pandas, NumPy |
| Persistence | joblib |
| Infrastructure | Docker, Docker Compose, Nginx |
