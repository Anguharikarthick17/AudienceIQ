import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Cpu,
  Star,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  Loader2,
  Info,
  Shield,
  Layers,
} from 'lucide-react'
import { api, formatErrorMessage, type ExplainRecommendationResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'

const AUDITED_GENRES = [
  'Action', 'Comedy', 'Sci-Fi', 'Drama', 'Thriller',
  'Animation', 'Documentary', 'Horror', 'Romance', 'Reality'
]

export default function RecommendationsPage() {
  const [userId, setUserId] = useState('VIEWER-409')
  const [watchTime, setWatchTime] = useState(85)
  const [sessionMins, setSessionMins] = useState(90)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Sci-Fi'])

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ExplainRecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    runExplain()
  }, [])

  const runExplain = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.explainRecommendations({
        user_id: userId,
        watch_time_hours: watchTime,
        avg_session_mins: sessionMins,
        top_genres: selectedGenres,
      })
      setData(res)
    } catch (err: unknown) {
      setError(formatErrorMessage(err, 'Failed to generate recommendation explanation'))
    } finally {
      setLoading(false)
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? (prev.length > 1 ? prev.filter(g => g !== genre) : prev)
        : [...prev, genre]
    )
  }

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5 text-yellow-400">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= count
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-zinc-700'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Why-Not Recommendation Engine" subtitle="Transparent Deterministic Content Ranking" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* Header Banner */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.12] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                <span>EXPLICIT REASONING TRACE</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Why-Not Recommendation Engine</h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Audited rule-based scoring engine providing dual justifications: exactly why candidate items are prioritized and why alternative titles are deprioritized.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 text-[11px] font-mono font-bold">
              ZERO BLACK-BOX • NO LLM
            </div>
          </div>
        </section>

        {/* Interactive Viewer Profile Tuner */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Test Viewer Telemetry Profile
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Assigned: <strong className="text-yellow-400">{data?.segment_name || 'Loading...'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Watch Time:</span>
                <span className="text-yellow-400 font-bold">{watchTime} hours</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={watchTime}
                onChange={e => setWatchTime(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Avg Session Duration:</span>
                <span className="text-yellow-400 font-bold">{sessionMins} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                value={sessionMins}
                onChange={e => setSessionMins(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                Affinity Genres:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AUDITED_GENRES.slice(0, 6).map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      selectedGenres.includes(g)
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GlassButton onClick={runExplain} disabled={loading} className="text-xs font-bold px-6">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              EVALUATE RECOMMENDATION LOGIC
            </GlassButton>
          </div>
        </GlassCard>

        {/* Dual Column: RECOMMENDED vs NOT PRIORITIZED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUMN 1: WHY RECOMMENDED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                  RECOMMENDED CANDIDATES
                </h3>
              </div>
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                SCORE ≥ 65
              </span>
            </div>

            {data?.recommended_items.map(item => (
              <GlassCard key={item.title} className="p-6 space-y-3 border-yellow-400/30 bg-yellow-400/[0.02]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-400 text-black">
                        {item.genre}
                      </span>
                      {renderStars(item.rating_stars)}
                    </div>
                    <h4 className="text-base font-bold text-white tracking-wide">{item.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-yellow-400">
                    {item.score}/100
                  </span>
                </div>

                {/* WHY RECOMMENDED TRACE */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 font-bold">
                    WHY RECOMMENDED:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans">
                    {item.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold">{r.slice(0, 1)}</span>
                        <span>{r.slice(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Genre Fit: {item.genre_compatibility}/40</span>
                  <span>Cohort Fit: {item.segment_compatibility}/30</span>
                  <span>Format Fit: {item.behavior_compatibility}/30</span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* COLUMN 2: WHY NOT PRIORITIZED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-mono font-bold uppercase text-slate-400 tracking-wider">
                  DEPRIORITIZED ALTERNATIVES
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                SCORE &lt; 65
              </span>
            </div>

            {data?.not_prioritized_items.map(item => (
              <GlassCard key={item.title} className="p-6 space-y-3 border-white/[0.08] bg-white/[0.01]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-slate-400">
                        {item.genre}
                      </span>
                      {renderStars(item.rating_stars)}
                    </div>
                    <h4 className="text-base font-bold text-slate-300 tracking-wide">{item.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {item.score}/100
                  </span>
                </div>

                {/* WHY NOT PRIORITIZED TRACE */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    WHY NOT PRIORITIZED:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400 font-sans">
                    {item.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-500 font-bold">{r.slice(0, 1)}</span>
                        <span>{r.slice(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Genre Fit: {item.genre_compatibility}/40</span>
                  <span>Cohort Fit: {item.segment_compatibility}/30</span>
                  <span>Format Fit: {item.behavior_compatibility}/30</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Scoring Architecture Footer */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span>Deterministic Scoring: Genre Alignment (40%) + Cohort Affinity (30%) + Behavioral Session Format (30%)</span>
          </div>
          <span className="text-yellow-400 font-bold">ZERO HALLUCINATIONS</span>
        </div>
      </div>
    </div>
  )
}
