/**
 * AudienceIQ API client
 * All calls go through /api prefix which Vite proxies to FastAPI in dev.
 * In production (Docker), Nginx proxies /api → api:8000.
 */

export const BACKEND_UNAVAILABLE_MSG = 'Backend API unavailable'
export const BACKEND_CONNECT_MSG = 'Connect a deployed AudienceIQ API to load live analytics.'

export class ApiError extends Error {
  status: number
  isUnavailable: boolean

  constructor(message: string, status: number = 0, isUnavailable: boolean = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.isUnavailable = isUnavailable
  }
}

export function isApiUnavailable(error: unknown): boolean {
  if (!error) return false
  if (error instanceof ApiError && error.isUnavailable) return true
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes('Backend API unavailable') ||
    msg.includes('Unexpected token') ||
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('<!doctype') ||
    msg.includes('is not valid JSON')
  )
}

export function formatErrorMessage(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!error) return fallback
  if (isApiUnavailable(error)) {
    return `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`
  }
  const msg = error instanceof Error ? error.message : String(error)
  if (msg.includes('Unexpected token') || msg.includes('<!doctype') || msg.includes('is not valid JSON')) {
    return `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`
  }
  return msg
}

const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api'
const API_BASE = RAW_API_BASE.replace(/\/+$/, '')

function getApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalized}`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path)
  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new ApiError(
      `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
      0,
      true
    )
  }

  // Ensure the response is JSON, not HTML (e.g. from Vercel/Nginx SPA fallback)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiError(
      `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
      res.status,
      true
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail || (typeof err === 'string' ? err : JSON.stringify(err))
    } catch {
      detail = `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`
    }
    throw new ApiError(detail, res.status, false)
  }

  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError(
      `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
      res.status,
      true
    )
  }
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

// ---- Advanced Intelligence Lab Types --------------------------------------

export interface ProfileInput {
  watch_time_hours: number
  avg_session_mins: number
  top_genres: string[]
  sessions_per_week?: number
  completion_rate?: number
  days_since_last_watch?: number
  weekend_activity_ratio?: number
}

export interface FeatureDelta {
  feature_name: string
  display_name: string
  original_value: number
  counterfactual_value: number
  delta: number
  pull_towards_target_centroid: number
}

export interface SegmentTransition {
  source_segment_id: number
  source_segment_name: string
  target_segment_id: number
  target_segment_name: string
  changed: boolean
}

export interface ProfileResult {
  segment_id: number
  segment_name: string
  distance_to_centroid: number
  all_distances: Record<number, number>
  feature_summary: Record<string, number>
}

export interface CounterfactualResponse {
  classification: string
  original: ProfileResult
  counterfactual: ProfileResult
  changed_features: FeatureDelta[]
  segment_transition: SegmentTransition
  explanation: string
  disclaimer: string
}

export interface ContradictionItem {
  rule_id: string
  title: string
  affected_features: string[]
  observed_values: Record<string, unknown>
  expected_relationship: string
  explanation: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface ContradictionResponse {
  contradictions_detected: boolean
  total_contradictions: number
  items: ContradictionItem[]
  mode: string
  label: string
  data_classification: string
  disclaimer: string
}

export interface MigrationPathway {
  source_segment_id: number
  source_segment_name: string
  target_segment_id: number
  target_segment_name: string
  transition_type: string
  simulated_users_count: number
  simulated_transition_rate: number
  feature_shifts: Record<string, number>
  original_distance: number
  new_distance: number
  explanation: string
}

export interface MigrationCohort {
  segment_id: number
  segment_name: string
  user_count: number
  audience_pct: number
  avg_watch_time: number
  avg_session_mins: number
  engagement_level: string
}

export interface MigrationResponse {
  temporal_data_available: boolean
  mode: string
  data_limitation_notice: string
  badge: string
  cohorts: MigrationCohort[]
  pathways: MigrationPathway[]
}

export interface GenreGapMetric {
  genre: string
  audience_demand_count: number
  audience_demand_share_pct: number
  catalog_count: number
  catalog_share_pct: number
  demand_coverage_gap_pct: number
  gap_status: 'DEFICIT' | 'BALANCED' | 'SURPLUS'
  is_critical_gap: boolean
  sample_titles: string[]
}

export interface ContentGapsResponse {
  total_viewers_analyzed: number
  total_catalog_titles: number
  exposure_measured: boolean
  data_honesty_statement: string
  classification_map: Record<string, string>
  genre_gaps: GenreGapMetric[]
  top_gap_genres: string[]
  why_this_gap_matters: string
}

export interface ScoredRecommendation {
  title: string
  genre: string
  status: 'RECOMMENDED' | 'NOT_PRIORITIZED'
  score: number
  rating_stars: number
  segment_compatibility: number
  genre_compatibility: number
  behavior_compatibility: number
  reasons: string[]
}

export interface ExplainRecommendationResponse {
  user_id: string
  segment_id: number
  segment_name: string
  confidence: string
  distance_to_centroid: number
  recommended_items: ScoredRecommendation[]
  not_prioritized_items: ScoredRecommendation[]
  scoring_framework: Record<string, unknown>
}

// ---- API Methods ----------------------------------------------------------

export const api = {
  health: () => request<HealthResponse>('/health'),

  uploadDataset: async (file: File): Promise<DatasetInspectionResponse> => {
    const form = new FormData()
    form.append('file', file)
    let res: Response
    try {
      res = await fetch(getApiUrl('/upload'), { method: 'POST', body: form })
    } catch {
      throw new ApiError(
        `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
        0,
        true
      )
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new ApiError(
        `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
        res.status,
        true
      )
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try {
        const e = await res.json()
        detail = e.detail || (typeof e === 'string' ? e : JSON.stringify(e))
      } catch {
        detail = `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`
      }
      throw new ApiError(detail, res.status, false)
    }

    try {
      return (await res.json()) as DatasetInspectionResponse
    } catch {
      throw new ApiError(
        `${BACKEND_UNAVAILABLE_MSG}. ${BACKEND_CONNECT_MSG}`,
        res.status,
        true
      )
    }
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

  // Advanced Intelligence Features:
  simulateCounterfactual: (payload: {
    original_profile: ProfileInput
    counterfactual_profile: ProfileInput
  }) => request<CounterfactualResponse>('/counterfactual', { method: 'POST', body: JSON.stringify(payload) }),

  detectContradictions: (payload: {
    profile: ProfileInput
    baseline_profile?: ProfileInput
  }) => request<ContradictionResponse>('/contradictions', { method: 'POST', body: JSON.stringify(payload) }),

  getMigration: () => request<MigrationResponse>('/migration'),

  getContentGaps: () => request<ContentGapsResponse>('/content-gaps'),

  explainRecommendations: (payload: {
    user_id: string
    watch_time_hours: number
    avg_session_mins: number
    top_genres: string[]
    sessions_per_week?: number
    completion_rate?: number
  }) => request<ExplainRecommendationResponse>('/recommend/explain', { method: 'POST', body: JSON.stringify(payload) }),
}
