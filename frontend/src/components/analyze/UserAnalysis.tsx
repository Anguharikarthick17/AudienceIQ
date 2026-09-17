import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Clock, Tv, BarChart3, ChevronDown, ChevronUp,
  ArrowRight, Lightbulb, AlertCircle, Loader2, Sparkles, Target, Compass
} from 'lucide-react'
import { api, formatErrorMessage, type AnalyzeResponse } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'
import RecommendationCard from './RecommendationCard'

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
  'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'Reality', 'Music', 'Kids',
]

export default function UserAnalysis() {
  const [form, setForm] = useState({
    user_id: '',
    watch_time_hours: '',
    avg_session_mins: '',
    sessions_per_week: '',
    completion_rate: '',
    genres: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  const toggleGenre = (g: string) => {
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g],
    }))
  }

  const handleQuickPreset = (preset: 'heavy_movie' | 'casual_binge') => {
    if (preset === 'heavy_movie') {
      setForm({
        user_id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        watch_time_hours: '92.5',
        avg_session_mins: '115',
        sessions_per_week: '6.5',
        completion_rate: '88',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
      })
    } else {
      setForm({
        user_id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        watch_time_hours: '24.0',
        avg_session_mins: '35',
        sessions_per_week: '3',
        completion_rate: '55',
        genres: ['Comedy', 'Animation'],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_id.trim() || !form.watch_time_hours || !form.avg_session_mins || form.genres.length === 0) {
      setError('Please fill in required fields (User ID, Watch Time, Avg Session) and select at least one genre.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.analyzeUser({
        user_id: form.user_id,
        watch_time_hours: parseFloat(form.watch_time_hours),
        avg_session_mins: parseFloat(form.avg_session_mins),
        sessions_per_week: form.sessions_per_week ? parseFloat(form.sessions_per_week) : undefined,
        completion_rate: form.completion_rate ? parseFloat(form.completion_rate) / 100 : undefined,
        top_genres: form.genres,
      })
      setResult(res)
    } catch (e: unknown) {
      setError(formatErrorMessage(e, 'Analysis failed'))
    } finally {
      setLoading(false)
    }
  }

  const ENGAGEMENT_BADGES: Record<string, string> = {
    High: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    Low: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Input Parameters Form */}
      <div className="xl:col-span-2">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Viewer Telemetry
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('heavy_movie')}
                className="text-[10px] font-mono text-yellow-400/80 hover:text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20 transition-colors"
              >
                + Heavy Preset
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('casual_binge')}
                className="text-[10px] font-mono text-slate-400 hover:text-white bg-white/[0.04] px-2 py-1 rounded border border-white/10 transition-colors"
              >
                + Casual
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Viewer Identifier *
              </label>
              <input
                className="input font-mono"
                placeholder="e.g. USR-8192"
                value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Watch Time (h) *
                </label>
                <input
                  className="input font-mono"
                  type="number"
                  min="0.01"
                  max="8760"
                  step="0.1"
                  placeholder="e.g. 65.5"
                  value={form.watch_time_hours}
                  onChange={e => setForm(f => ({ ...f, watch_time_hours: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Avg Session (m) *
                </label>
                <input
                  className="input font-mono"
                  type="number"
                  min="1"
                  max="1440"
                  step="1"
                  placeholder="e.g. 70"
                  value={form.avg_session_mins}
                  onChange={e => setForm(f => ({ ...f, avg_session_mins: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Sessions / Week
                </label>
                <input
                  className="input font-mono"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 7"
                  value={form.sessions_per_week}
                  onChange={e => setForm(f => ({ ...f, sessions_per_week: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Completion (%)
                </label>
                <input
                  className="input font-mono"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 80"
                  value={form.completion_rate}
                  onChange={e => setForm(f => ({ ...f, completion_rate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Top Content Genres * ({form.genres.length} selected)
              </label>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                {AVAILABLE_GENRES.map(g => {
                  const isSelected = form.genres.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 select-none ${
                        isSelected
                          ? 'bg-yellow-400 text-black font-bold border border-yellow-300 shadow-[0_0_12px_rgba(255,212,0,0.4)] scale-105'
                          : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:border-yellow-400/40 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center group"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Evaluating Model Inference…' : 'Classify Profile →'}</span>
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Results View */}
      <div className="xl:col-span-3 space-y-4">
        {!result && !loading && (
          <GlassCard className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 shadow-inner">
              <Compass className="w-8 h-8 text-yellow-400/60" />
            </div>
            <h4 className="text-base font-bold text-white">No Profile Evaluated</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Input telemetry on the left or choose a quick preset to trigger the scikit-learn pipeline inference.
            </p>
          </GlassCard>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Segment Assignment Header Card */}
            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold">
                      INFERRED COHORT
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] font-mono text-slate-400">ID #{result.segment_id}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                    {result.segment_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Represents {result.audience_pct.toFixed(1)}% of total platform audience
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${ENGAGEMENT_BADGES[result.engagement_level] || 'badge-yellow'}`}>
                  {result.engagement_level.toUpperCase()} ENGAGEMENT
                </span>
              </div>

              {/* Centroid Distance HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.08]">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] font-mono uppercase text-slate-400">Centroid Distance</p>
                  <p className="text-base font-bold font-mono text-yellow-400 mt-0.5">
                    {result.distance_to_centroid.toFixed(3)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] font-mono uppercase text-slate-400">Cohort Share</p>
                  <p className="text-base font-bold font-mono text-white mt-0.5">
                    {result.audience_pct.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-mono uppercase text-slate-400">Assignment Method</p>
                  <p className="text-xs font-mono text-emerald-400 mt-1 font-bold">
                    Nearest Euclidean
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Explainable Reasoning */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  Traceable Classification Rationale
                </p>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {result.segment_explanation}
              </p>
            </GlassCard>

            {/* Behavioral Signals Grid */}
            <GlassCard className="p-6">
              <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-4">
                Behavioral Signal Telemetry
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.behavior_signals.map((signal, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 hover:border-yellow-400/30 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD400] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{signal.signal}</span>
                        <span className="text-xs font-mono font-bold text-yellow-400">{signal.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{signal.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Personalized Recommendations */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_#FFD400]" />
                  <p className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Rule-Based Personalized Content Recommendations
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {result.recommendations.length} ITEMS
                </span>
              </div>

              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <RecommendationCard
                    key={i}
                    recommendation={rec}
                    rationale={result.recommendation_rationales[i]}
                    index={i}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
