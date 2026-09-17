import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, RefreshCw, Sliders, Target, Shield, HelpCircle, Loader2, CheckCircle2
} from 'lucide-react'
import { api, formatErrorMessage, type AnalyzeResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'
import Floating3DCubes from '@/components/common/Floating3DCubes'

const AVAILABLE_GENRES = [
  'Action', 'Sci-Fi', 'Comedy', 'Drama', 'Thriller', 'Animation', 'Documentary', 'Romance'
]

export default function Counterfactual() {
  // Baseline profile
  const [watchTime, setWatchTime] = useState(30)
  const [avgSession, setAvgSession] = useState(45)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3)
  const [completionRate, setCompletionRate] = useState(65)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Comedy', 'Drama'])

  const [loading, setLoading] = useState(false)
  const [baselineResult, setBaselineResult] = useState<AnalyzeResponse | null>(null)
  const [counterfactualResult, setCounterfactualResult] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Run initial baseline
  useEffect(() => {
    runInference(30, 45, 3, 65, ['Comedy', 'Drama'], true)
  }, [])

  const runInference = async (
    wt: number,
    session: number,
    spw: number,
    comp: number,
    genres: string[],
    isBaseline: boolean = false
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.analyzeUser({
        user_id: isBaseline ? 'BASELINE-SIM' : 'COUNTERFACTUAL-SIM',
        watch_time_hours: wt,
        avg_session_mins: session,
        sessions_per_week: spw,
        completion_rate: comp / 100,
        top_genres: genres,
      })
      if (isBaseline) {
        setBaselineResult(res)
        setCounterfactualResult(res)
      } else {
        setCounterfactualResult(res)
      }
    } catch (e: unknown) {
      setError(formatErrorMessage(e, 'Simulation failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = () => {
    runInference(watchTime, avgSession, sessionsPerWeek, completionRate, selectedGenres, false)
  }

  const handleReset = () => {
    setWatchTime(30)
    setAvgSession(45)
    setSessionsPerWeek(3)
    setCompletionRate(65)
    setSelectedGenres(['Comedy', 'Drama'])
    runInference(30, 45, 3, 65, ['Comedy', 'Drama'], true)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? (prev.length > 1 ? prev.filter(g => g !== genre) : prev)
        : [...prev, genre]
    )
  }

  const isMigrated = baselineResult && counterfactualResult && baselineResult.segment_id !== counterfactualResult.segment_id

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="Counterfactual Lab" subtitle="Hypothetical Behavior Perturbation Engine" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* Lab Header */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent 
                            border border-white/[0.12] border-t-white/[0.22] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>WHAT-IF SCENARIO SIMULATOR</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                Simulate Viewer Shifts. <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(255,212,0,0.4)]">Discover Transitions.</span>
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Perturb behavioral features (watch hours, session depth, frequency, genre affinities) in real time to observe whether a viewer migrates across quantitative KMeans decision boundaries.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <Floating3DCubes size={220} />
            </div>
          </div>
        </section>

        {/* Interactive Lab Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5">
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Behavioral Perturbation Sliders
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-[11px] font-mono text-slate-400 hover:text-yellow-400 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Slider 1: Watch Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Watch Time:</span>
                  <span className="text-yellow-400 font-bold">{watchTime} hours</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="1"
                  value={watchTime}
                  onChange={e => setWatchTime(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>5h (Low)</span>
                  <span>75h</span>
                  <span>150h (Heavy)</span>
                </div>
              </div>

              {/* Slider 2: Avg Session */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Avg Session Duration:</span>
                  <span className="text-yellow-400 font-bold">{avgSession} mins</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="5"
                  value={avgSession}
                  onChange={e => setAvgSession(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>15m (Bite-size)</span>
                  <span>90m</span>
                  <span>180m (Feature film)</span>
                </div>
              </div>

              {/* Slider 3: Sessions / Week */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Sessions Per Week:</span>
                  <span className="text-yellow-400 font-bold">{sessionsPerWeek} sessions</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={sessionsPerWeek}
                  onChange={e => setSessionsPerWeek(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Slider 4: Completion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Content Completion Rate:</span>
                  <span className="text-yellow-400 font-bold">{completionRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={completionRate}
                  onChange={e => setCompletionRate(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Genre Selection */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-mono text-slate-300 block">
                  Hypothetical Genre Affinities:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_GENRES.map(genre => {
                    const isSelected = selectedGenres.includes(genre)
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-yellow-400 text-black font-bold border border-yellow-300 shadow-[0_0_10px_rgba(255,212,0,0.35)]'
                            : 'bg-white/[0.04] text-slate-400 border border-white/10 hover:border-yellow-400/40 hover:text-white'
                        }`}
                      >
                        {genre}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Run Simulation Action */}
              <div className="pt-3">
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={handleSimulate}
                  disabled={loading}
                  className="w-full justify-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Evaluating Model…' : 'Compute Counterfactual Shift →'}</span>
                </GlassButton>
              </div>
            </GlassCard>
          </div>

          {/* Output Analysis Column */}
          <div className="lg:col-span-7 space-y-5">
            {error && (
              <GlassCard className="p-4 border-red-500/30 text-red-400 text-xs font-mono">
                {error}
              </GlassCard>
            )}

            {/* Before vs After Comparison Card */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <p className="section-label">Cohort Transition Outcome</p>
                {isMigrated ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-yellow-400 text-black shadow-[0_0_15px_#FFD400]">
                    MIGRATION DETECTED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-white/[0.05] border border-white/10">
                    STABLE IN COHORT
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {/* Baseline State */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Baseline Position</div>
                  <p className="text-lg font-bold text-white">
                    {baselineResult?.segment_name || 'Loading…'}
                  </p>
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    <p>Centroid Distance: <span className="text-white">{baselineResult?.distance_to_centroid.toFixed(3) ?? '—'}</span></p>
                    <p>Engagement: <span className="text-yellow-400">{baselineResult?.engagement_level ?? '—'}</span></p>
                  </div>
                </div>

                {/* Counterfactual State */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isMigrated
                    ? 'bg-yellow-400/[0.06] border-yellow-400/50 shadow-[0_0_20px_rgba(255,212,0,0.12)]'
                    : 'bg-white/[0.02] border-white/[0.08]'
                }`}>
                  <div className="text-[10px] font-mono uppercase text-yellow-400 font-bold">
                    Counterfactual Position
                  </div>
                  <p className="text-lg font-bold text-white">
                    {counterfactualResult?.segment_name || 'Loading…'}
                  </p>
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    <p>Centroid Distance: <span className="text-white">{counterfactualResult?.distance_to_centroid.toFixed(3) ?? '—'}</span></p>
                    <p>Engagement: <span className="text-yellow-400">{counterfactualResult?.engagement_level ?? '—'}</span></p>
                  </div>
                </div>
              </div>

              {/* Explainable Shift Rationale */}
              {counterfactualResult && (
                <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase">
                    <Target className="w-3.5 h-3.5" />
                    <span>Inference Decision Boundary Reason</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {counterfactualResult.segment_explanation}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Counterfactual Personalized Recommendations */}
            {counterfactualResult && (
              <GlassCard className="p-6">
                <p className="section-label mb-3">Counterfactual Adapted Recommendations</p>
                <div className="space-y-2">
                  {counterfactualResult.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">{rec}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {counterfactualResult.recommendation_rationales[i]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
