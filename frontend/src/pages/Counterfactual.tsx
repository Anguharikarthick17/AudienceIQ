import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sliders,
  Shield,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { api, formatErrorMessage, type CounterfactualResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'

const AUDITED_GENRES = [
  'Action', 'Comedy', 'Sci-Fi', 'Drama', 'Thriller',
  'Animation', 'Documentary', 'Horror', 'Romance', 'Reality'
]

export default function Counterfactual() {
  // Original (Baseline) Profile
  const [origWatchTime, setOrigWatchTime] = useState(30)
  const [origSession, setOrigSession] = useState(35)
  const [origSessionsPerWeek, setOrigSessionsPerWeek] = useState(4)
  const [origCompletionRate, setOrigCompletionRate] = useState(45)
  const [origDaysSinceWatch, setOrigDaysSinceWatch] = useState(14)
  const [origWeekendRatio, setOrigWeekendRatio] = useState(50)
  const [origGenres, setOrigGenres] = useState<string[]>(['Comedy', 'Drama'])

  // Counterfactual (What-If) Profile
  const [cfWatchTime, setCfWatchTime] = useState(105)
  const [cfSession, setCfSession] = useState(110)
  const [cfSessionsPerWeek, setCfSessionsPerWeek] = useState(9)
  const [cfCompletionRate, setCfCompletionRate] = useState(85)
  const [cfDaysSinceWatch, setCfDaysSinceWatch] = useState(5)
  const [cfWeekendRatio, setCfWeekendRatio] = useState(55)
  const [cfGenres, setCfGenres] = useState<string[]>(['Action', 'Sci-Fi', 'Thriller'])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CounterfactualResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Run initial simulation on load
  useEffect(() => {
    runSimulation()
  }, [])

  const runSimulation = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.simulateCounterfactual({
        original_profile: {
          watch_time_hours: origWatchTime,
          avg_session_mins: origSession,
          top_genres: origGenres,
          sessions_per_week: origSessionsPerWeek,
          completion_rate: origCompletionRate / 100,
          days_since_last_watch: origDaysSinceWatch,
          weekend_activity_ratio: origWeekendRatio / 100,
        },
        counterfactual_profile: {
          watch_time_hours: cfWatchTime,
          avg_session_mins: cfSession,
          top_genres: cfGenres,
          sessions_per_week: cfSessionsPerWeek,
          completion_rate: cfCompletionRate / 100,
          days_since_last_watch: cfDaysSinceWatch,
          weekend_activity_ratio: cfWeekendRatio / 100,
        },
      })
      setResult(res)
    } catch (err: unknown) {
      setError(formatErrorMessage(err, 'Counterfactual simulation failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setOrigWatchTime(30)
    setOrigSession(35)
    setOrigSessionsPerWeek(4)
    setOrigCompletionRate(45)
    setOrigDaysSinceWatch(14)
    setOrigWeekendRatio(50)
    setOrigGenres(['Comedy', 'Drama'])

    setCfWatchTime(105)
    setCfSession(110)
    setCfSessionsPerWeek(9)
    setCfCompletionRate(85)
    setCfDaysSinceWatch(5)
    setCfWeekendRatio(55)
    setCfGenres(['Action', 'Sci-Fi', 'Thriller'])
  }

  const toggleGenre = (genre: string, isOriginal: boolean) => {
    if (isOriginal) {
      setOrigGenres(prev =>
        prev.includes(genre)
          ? (prev.length > 1 ? prev.filter(g => g !== genre) : prev)
          : [...prev, genre]
      )
    } else {
      setCfGenres(prev =>
        prev.includes(genre)
          ? (prev.length > 1 ? prev.filter(g => g !== genre) : prev)
          : [...prev, genre]
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Counterfactual Lab" subtitle="Hypothetical Behavior Perturbation Engine" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* Lab Header */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.12] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>WHAT-IF SENSITIVITY LAB</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Counterfactual Lab</h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Perturb behavioral telemetry through the exact persisted KMeans pipeline to observe how hypothetical changes cross cluster boundaries.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#FFD400]" />
                <span>COUNTERFACTUAL SIMULATION</span>
              </div>
              <GlassButton variant="secondary" onClick={handleReset} className="text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </GlassButton>
            </div>
          </div>
        </section>

        {/* Dual Input Panels: ORIGINAL vs WHAT-IF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ORIGINAL PROFILE */}
          <GlassCard className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 font-mono font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">ORIGINAL PROFILE</h3>
                  <p className="text-[11px] font-mono text-slate-400">Baseline Observed Telemetry</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/[0.04] text-slate-300 border border-white/10">
                BENCHMARK
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Watch Time:</span>
                  <span className="text-white font-bold">{origWatchTime} hours</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="240"
                  value={origWatchTime}
                  onChange={e => setOrigWatchTime(Number(e.target.value))}
                  className="w-full accent-zinc-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Avg Session Duration:</span>
                  <span className="text-white font-bold">{origSession} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={origSession}
                  onChange={e => setOrigSession(Number(e.target.value))}
                  className="w-full accent-zinc-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Sessions/Wk:</span>
                    <span className="text-white font-bold">{origSessionsPerWeek}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={origSessionsPerWeek}
                    onChange={e => setOrigSessionsPerWeek(Number(e.target.value))}
                    className="w-full accent-zinc-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Completion:</span>
                    <span className="text-white font-bold">{origCompletionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={origCompletionRate}
                    onChange={e => setOrigCompletionRate(Number(e.target.value))}
                    className="w-full accent-zinc-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Audited Genres ({origGenres.length} selected):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDITED_GENRES.map(g => {
                    const active = origGenres.includes(g)
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g, true)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          active
                            ? 'bg-zinc-700 text-white border border-zinc-500 shadow-sm'
                            : 'bg-white/[0.02] text-slate-400 border border-white/[0.05] hover:border-white/20'
                        }`}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* WHAT-IF COUNTERFACTUAL PROFILE */}
          <GlassCard className="p-6 lg:p-8 space-y-6 border-yellow-400/30 bg-gradient-to-br from-yellow-400/[0.02] via-white/[0.02] to-transparent shadow-[0_0_30px_rgba(255,212,0,0.06)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-mono font-bold text-xs">
                  B
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">WHAT-IF PROFILE</h3>
                  <p className="text-[11px] font-mono text-yellow-400/80">Hypothetical Perturbations</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                SIMULATED
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Watch Time:</span>
                  <span className="text-yellow-400 font-bold">{cfWatchTime} hours</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="240"
                  value={cfWatchTime}
                  onChange={e => setCfWatchTime(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Avg Session Duration:</span>
                  <span className="text-yellow-400 font-bold">{cfSession} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={cfSession}
                  onChange={e => setCfSession(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Sessions/Wk:</span>
                    <span className="text-yellow-400 font-bold">{cfSessionsPerWeek}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={cfSessionsPerWeek}
                    onChange={e => setCfSessionsPerWeek(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Completion:</span>
                    <span className="text-yellow-400 font-bold">{cfCompletionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={cfCompletionRate}
                    onChange={e => setCfCompletionRate(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono text-yellow-400 uppercase tracking-wider mb-2 font-semibold">
                  Audited Genres ({cfGenres.length} selected):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDITED_GENRES.map(g => {
                    const active = cfGenres.includes(g)
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g, false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          active
                            ? 'bg-yellow-400 text-black font-bold border border-yellow-400 shadow-[0_0_12px_rgba(255,212,0,0.3)]'
                            : 'bg-white/[0.02] text-slate-400 border border-white/[0.05] hover:border-yellow-400/30'
                        }`}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center">
          <GlassButton
            onClick={runSimulation}
            disabled={loading}
            className="px-10 py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(255,212,0,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                Simulating KMeans Boundaries...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-black" />
                SIMULATE COUNTERFACTUAL
              </>
            )}
          </GlassButton>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* RESULTS: SEGMENT TRANSITION & ATTRIBUTION */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* SEGMENT TRANSITION SUMMARY */}
            <GlassCard className="p-8 space-y-6 border-yellow-400/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold">
                    SEGMENT TRANSITION OUTCOME
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/[0.04] text-[11px] font-mono text-slate-400 border border-white/10">
                  NOT CAUSAL INFERENCE
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* ORIGINAL SEGMENT */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    ORIGINAL CLASSIFICATION
                  </span>
                  <h4 className="text-xl font-black text-white">{result.original.segment_name}</h4>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span>Distance to Centroid:</span>
                    <span className="text-white font-bold">{result.original.distance_to_centroid.toFixed(3)}</span>
                  </div>
                </div>

                {/* TRANSITION ARROW */}
                <div className="md:col-span-1 flex justify-center py-2">
                  <div className={`p-3 rounded-full ${
                    result.segment_transition.changed
                      ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(255,212,0,0.5)]'
                      : 'bg-zinc-800 text-slate-400'
                  }`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* COUNTERFACTUAL SEGMENT */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-yellow-400/[0.04] border border-yellow-400/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider">
                      COUNTERFACTUAL CLASSIFICATION
                    </span>
                    {result.segment_transition.changed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-400 text-black">
                        TRANSITIONED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/[0.05]">
                        SAME CLUSTER
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-yellow-400">{result.counterfactual.segment_name}</h4>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span>Distance to Centroid:</span>
                    <span className="text-yellow-400 font-bold">{result.counterfactual.distance_to_centroid.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Mathematical Explanation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <p className="text-xs font-mono text-yellow-400 uppercase font-bold tracking-wider">
                  Why did this assignment happen?
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {result.explanation}
                </p>
              </div>
            </GlassCard>

            {/* CHANGED FEATURES & ATTRIBUTION TABLE */}
            <GlassCard className="p-6 lg:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Changed Features & Attribution Impact
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Quantified mathematical pull towards the target KMeans cluster centroid
                  </p>
                </div>
                <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded border border-yellow-400/30">
                  {result.changed_features.length} FEATURES MODIFIED
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3 text-right">Original</th>
                      <th className="py-2.5 px-3 text-center">→</th>
                      <th className="py-2.5 px-3">Counterfactual</th>
                      <th className="py-2.5 px-3 text-right">Delta</th>
                      <th className="py-2.5 px-3 text-right">Target Pull Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {result.changed_features.map(f => {
                      const isPositivePull = f.pull_towards_target_centroid > 0
                      return (
                        <tr key={f.feature_name} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-white font-sans font-semibold">
                            {f.display_name}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {f.original_value}
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-600">→</td>
                          <td className="py-2.5 px-3 text-yellow-400 font-bold">
                            {f.counterfactual_value}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            {f.delta > 0 ? `+${f.delta}` : f.delta}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isPositivePull
                                ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                                : 'bg-zinc-800 text-slate-400'
                            }`}>
                              {f.pull_towards_target_centroid.toFixed(3)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{result.disclaimer}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
