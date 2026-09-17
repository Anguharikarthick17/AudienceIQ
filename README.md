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
