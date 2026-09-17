/**
 * AudienceIQ API client
 * All calls go through /api prefix which Vite proxies to FastAPI in dev.
 * In production (Docker), Nginx proxies /api → api:8000.
 */

const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api'
const API_BASE = RAW_API_BASE.replace(/\/+$/, '')

function getApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalized}`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail || JSON.stringify(err)
    } catch {}
    throw new Error(detail)
  }

  return res.json() as Promise<T>
}

// ---- Types ----------------------------------------------------------------

export interface HealthResponse {
  status: string
  model_loaded: boolean
  model_trained_at?: string
  n_clusters?: number
  n_training_users?: number
}

export interface ColumnProfile {
  name: string
  dtype: string
  missing_count: number
  missing_pct: number
  unique_count: number
  sample_values: unknown[]
}

export interface DetectedFeatures {
  user_id_col?: string
  watch_time_cols: string[]
  session_duration_cols: string[]
  session_count_cols: string[]
  genre_cols: string[]
  completion_cols: string[]
  recency_cols: string[]
  activity_pattern_cols: string[]
  unrecognized_numeric: string[]
  unrecognized_categorical: string[]
}

export interface DatasetQuality {
  total_rows: number
  total_cols: number
  duplicate_rows: number
  duplicate_pct: number
  missing_cells: number
  missing_cell_pct: number
  numeric_cols: number
  categorical_cols: number
  usable_behavioral_features: number
  ready_to_train: boolean
  warnings: string[]
}

export interface DatasetInspectionResponse {
  filename: string
  quality: DatasetQuality
  columns: ColumnProfile[]
  detected_features: DetectedFeatures
  message: string
}

export interface TrainResponse {
  status: string
  n_clusters: number
  silhouette_score: number
  inertia: number
  n_users: number
  trained_at: string
  k_evaluation: { k: number; silhouette_score: number; inertia: number }[]
  message: string
}

export interface SegmentSummary {
  segment_id: number
  segment_name: string
  user_count: number
  audience_pct: number
  avg_watch_time: number
  avg_session_mins: number
  dominant_genres: string[]
  engagement_level: string
}

export interface DashboardResponse {
  total_viewers: number
  n_segments: number
  avg_watch_time: number
  avg_session_mins: number
  silhouette_score: number
  inertia: number
  segments: SegmentSummary[]
  genre_distribution: Record<string, number>
  dataset_quality?: DatasetQuality
  model_status: string
}

export interface SegmentDetail {
  segment_id: number
  segment_name: string
  user_count: number
  audience_pct: number
  avg_watch_time: number
  avg_session_mins: number
  dominant_genres: string[]
  engagement_level: string
  engagement_characteristics: string[]
  recommendation_strategy: string
  behavioral_profile: Record<string, unknown>
}

export interface BehaviorSignal {
  signal: string
  value: string
  interpretation: string
}

export interface AnalyzeResponse {
  user_id: string
  segment_id: number
  segment_name: string
  audience_pct: number
  engagement_level: string
  dominant_content: string[]
  behavior_signals: BehaviorSignal[]
  segment_explanation: string
  recommendations: string[]
  recommendation_rationales: string[]
  distance_to_centroid: number
}

export interface RecommendResponse {
  user_id: string
  segment_id: number
  segment_name: string
  recommendations: string[]
  distance_to_centroid: number
  explanation: string
  confidence: string
}

export interface KEvalPoint {
  k: number
  silhouette_score: number
  inertia: number
}

export interface ModelInfoResponse {
  model_loaded: boolean
  model_status: string
  trained_at?: string
  selected_k?: number
  silhouette_score?: number
  inertia?: number
  n_training_users?: number
  cluster_balance?: number[]
  k_evaluation?: KEvalPoint[]
  pipeline_path: string
  artifact_exists: boolean
}

// ---- API Methods ----------------------------------------------------------

export const api = {
  health: () => request<HealthResponse>('/health'),

  uploadDataset: async (file: File): Promise<DatasetInspectionResponse> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(getApiUrl('/upload'), { method: 'POST', body: form })
    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try { const e = await res.json(); detail = e.detail || detail } catch {}
      throw new Error(detail)
    }
    return res.json()
  },

  trainModel: () => request<TrainResponse>('/train', { method: 'POST' }),

  getDashboard: () => request<DashboardResponse>('/dashboard'),

  getSegments: () => request<SegmentDetail[]>('/segments'),

  getSegment: (id: number) => request<SegmentDetail>(`/segments/${id}`),

  analyzeUser: (payload: {
    user_id: string
    watch_time_hours: number
    top_genres: string[]
    avg_session_mins: number
    sessions_per_week?: number
    completion_rate?: number
  }) => request<AnalyzeResponse>('/analyze', { method: 'POST', body: JSON.stringify(payload) }),

  recommend: (payload: {
    user_id: string
    watch_time_hours: number
    top_genres: string[]
    avg_session_mins: number
  }) => request<RecommendResponse>('/recommend', { method: 'POST', body: JSON.stringify(payload) }),

  getModelInfo: () => request<ModelInfoResponse>('/model-info'),
}
