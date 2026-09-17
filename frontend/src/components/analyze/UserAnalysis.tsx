import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Clock, Tv, BarChart3, ChevronDown, ChevronUp,
  ArrowRight, Lightbulb, AlertCircle, Loader2
} from 'lucide-react'
import { api, type AnalyzeResponse } from '@/api/client'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_id.trim() || !form.watch_time_hours || !form.avg_session_mins || form.genres.length === 0) {
      setError('Please fill in all required fields and select at least one genre.')
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
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const ENGAGEMENT_COLORS: Record<string, string> = {
    High: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    Low: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Form */}
      <div className="xl:col-span-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">User Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">User ID *</label>
              <input className="input" placeholder="e.g. USR-8192"
                value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Watch Time (hours) *</label>
                <input className="input" type="number" min="0.01" max="8760" step="0.1"
                  placeholder="e.g. 45.5" value={form.watch_time_hours}
                  onChange={e => setForm(f => ({ ...f, watch_time_hours: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Avg Session (mins) *</label>
                <input className="input" type="number" min="1" max="1440" step="1"
                  placeholder="e.g. 60" value={form.avg_session_mins}
                  onChange={e => setForm(f => ({ ...f, avg_session_mins: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Sessions/Week</label>
                <input className="input" type="number" min="0" step="0.5"
                  placeholder="e.g. 7" value={form.sessions_per_week}
                  onChange={e => setForm(f => ({ ...f, sessions_per_week: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Completion Rate (%)</label>
                <input className="input" type="number" min="0" max="100"
                  placeholder="e.g. 75" value={form.completion_rate}
                  onChange={e => setForm(f => ({ ...f, completion_rate: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Content Genres * (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(g => (
                  <button key={g} type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                      form.genres.includes(g)
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Analyzing…' : 'Analyze Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="xl:col-span-3 space-y-4">
        {!result && !loading && (
          <div className="card flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <User className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Fill in a user profile and click Analyze</p>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Segment assignment */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="section-label">Audience Segment</p>
                <span className={`badge border ${ENGAGEMENT_COLORS[result.engagement_level] || 'badge-brand'}`}>
                  {result.engagement_level} Engagement
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-50">{result.segment_name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Segment #{result.segment_id} · {result.audience_pct.toFixed(1)}% of audience ·
                Centroid distance: {result.distance_to_centroid.toFixed(3)}
              </p>
            </div>

            {/* Explanation */}
            <div className="card">
              <p className="section-label mb-2">Why This Segment?</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.segment_explanation}</p>
            </div>

            {/* Behavior signals */}
            <div className="card">
              <p className="section-label mb-3">Behavioral Signals</p>
              <div className="space-y-2.5">
                {result.behavior_signals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{signal.signal}</span>
                        <span className="text-xs text-brand-400 font-mono">{signal.value}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{signal.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-brand-400" />
                <p className="section-label">Personalized Recommendations</p>
              </div>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <RecommendationCard
                    key={i}
                    recommendation={rec}
                    rationale={result.recommendation_rationales[i]}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
