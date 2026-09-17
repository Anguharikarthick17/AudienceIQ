import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Shield,
  Loader2,
  Info,
  Layers,
} from 'lucide-react'
import { api, formatErrorMessage, type ContradictionResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'

const AUDITED_GENRES = [
  'Action', 'Comedy', 'Sci-Fi', 'Drama', 'Thriller',
  'Animation', 'Documentary', 'Horror', 'Romance', 'Reality'
]

export default function Contradiction() {
  const [isComparisonMode, setIsComparisonMode] = useState(false)

  // Primary Profile
  const [watchTime, setWatchTime] = useState(115)
  const [sessionMins, setSessionMins] = useState(12)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(8)
  const [completionRate, setCompletionRate] = useState(8)
  const [daysSinceWatch, setDaysSinceWatch] = useState(28)
  const [weekendRatio, setWeekendRatio] = useState(50)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Horror', 'Romance', 'Reality'])

  // Baseline Comparison Profile
  const [baseWatchTime, setBaseWatchTime] = useState(40)
  const [baseSessionMins, setBaseSessionMins] = useState(45)
  const [baseSessionsPerWeek, setBaseSessionsPerWeek] = useState(4)
  const [baseCompletionRate, setBaseCompletionRate] = useState(65)
  const [baseDaysSinceWatch, setBaseDaysSinceWatch] = useState(3)
  const [baseWeekendRatio, setBaseWeekendRatio] = useState(50)
  const [baseGenres, setBaseGenres] = useState<string[]>(['Drama', 'Comedy'])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ContradictionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    runDetection()
  }, [isComparisonMode])

  const runDetection = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload: Parameters<typeof api.detectContradictions>[0] = {
        profile: {
          watch_time_hours: watchTime,
          avg_session_mins: sessionMins,
          top_genres: selectedGenres,
          sessions_per_week: sessionsPerWeek,
          completion_rate: completionRate / 100,
          days_since_last_watch: daysSinceWatch,
          weekend_activity_ratio: weekendRatio / 100,
        },
      }

      if (isComparisonMode) {
        payload.baseline_profile = {
          watch_time_hours: baseWatchTime,
          avg_session_mins: baseSessionMins,
          top_genres: baseGenres,
          sessions_per_week: baseSessionsPerWeek,
          completion_rate: baseCompletionRate / 100,
          days_since_last_watch: baseDaysSinceWatch,
          weekend_activity_ratio: baseWeekendRatio / 100,
        }
      }

      const res = await api.detectContradictions(payload)
      setResult(res)
    } catch (err: unknown) {
      setError(formatErrorMessage(err, 'Contradiction audit failed'))
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

  const loadPreset = (type: 'inconsistent' | 'clean') => {
    if (type === 'inconsistent') {
      setWatchTime(120)
      setSessionMins(12)
      setSessionsPerWeek(8)
      setCompletionRate(5)
      setDaysSinceWatch(28)
      setSelectedGenres(['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Horror', 'Romance', 'Reality'])
    } else {
      setWatchTime(45)
      setSessionMins(50)
      setSessionsPerWeek(4)
      setCompletionRate(70)
      setDaysSinceWatch(3)
      setSelectedGenres(['Action', 'Thriller'])
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Contradiction Detector" subtitle="Rule-Based Behavioral Inconsistency Audit" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* Header */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.12] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <GitCompare className="w-3.5 h-3.5" />
                <span>BEHAVIORAL INCOHERENCE AUDIT</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Audience Contradiction Detector</h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Flags behavioral telemetry combinations that depart from standard OTT patterns (e.g. extensive watch volume paired with micro-sessions or dormant recency).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsComparisonMode(!isComparisonMode)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isComparisonMode
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(255,212,0,0.4)]'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                {isComparisonMode ? '✓ Comparison Mode Active' : 'Enable Comparison Mode'}
              </button>
            </div>
          </div>
        </section>

        {/* Presets & Comparison Notice */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Quick Test Profiles:</span>
            <button
              onClick={() => loadPreset('inconsistent')}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
            >
              Load Inconsistent Profile
            </button>
            <button
              onClick={() => loadPreset('clean')}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
            >
              Load Clean Profile
            </button>
          </div>

          {isComparisonMode && (
            <div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono">
              Profile comparison — not historical behavior.
            </div>
          )}
        </div>

        {/* Profile Tuner Grid */}
        <div className={`grid grid-cols-1 ${isComparisonMode ? 'lg:grid-cols-2' : 'lg:grid-cols-12'} gap-6`}>
          {/* Main Profile Under Audit */}
          <GlassCard className={`${isComparisonMode ? '' : 'lg:col-span-5'} p-6 space-y-5`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Audited Profile Parameters
                </span>
              </div>
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                AUDITED
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Watch Time:</span>
                  <span className="text-yellow-400 font-bold">{watchTime} hours</span>
                </div>
                <input
                  type="range"
                  min="2"
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
                  min="5"
                  max="180"
                  value={sessionMins}
                  onChange={e => setSessionMins(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Sessions/Wk:</span>
                    <span className="text-white font-bold">{sessionsPerWeek}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={sessionsPerWeek}
                    onChange={e => setSessionsPerWeek(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Completion:</span>
                    <span className="text-white font-bold">{completionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={completionRate}
                    onChange={e => setCompletionRate(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300">Days Since Last Watch:</span>
                  <span className="text-white font-bold">{daysSinceWatch} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={daysSinceWatch}
                  onChange={e => setDaysSinceWatch(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Selected Genres ({selectedGenres.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDITED_GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
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

              <GlassButton onClick={runDetection} disabled={loading} className="w-full text-xs font-bold mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GitCompare className="w-4 h-4 mr-2" />}
                AUDIT INCONSISTENCIES
              </GlassButton>
            </div>
          </GlassCard>

          {/* Results Column */}
          <div className={`${isComparisonMode ? '' : 'lg:col-span-7'} space-y-4`}>
            {/* Status Summary Banner */}
            {result && (
              <GlassCard className={`p-6 border ${
                result.contradictions_detected
                  ? 'border-amber-400/40 bg-amber-400/[0.02]'
                  : 'border-emerald-400/40 bg-emerald-400/[0.02]'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      result.contradictions_detected
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                        : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                    }`}>
                      {result.contradictions_detected ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {result.contradictions_detected
                          ? `${result.total_contradictions} Behavioral Inconsistencies Detected`
                          : 'Telemetry Structurally Coherent'}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {result.label}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white/[0.05] text-slate-300 border border-white/10">
                    {result.data_classification}
                  </span>
                </div>
              </GlassCard>
            )}

            {/* Inconsistency Cards List */}
            {result && result.items.length > 0 ? (
              <div className="space-y-3">
                {result.items.map(item => {
                  const severityColor =
                    item.severity === 'HIGH'
                      ? 'border-red-500/40 bg-red-500/[0.02] text-red-400'
                      : item.severity === 'MEDIUM'
                      ? 'border-yellow-400/40 bg-yellow-400/[0.02] text-yellow-400'
                      : 'border-white/10 bg-white/[0.02] text-slate-300'

                  return (
                    <GlassCard key={item.rule_id} className={`p-5 space-y-3 border ${severityColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#FFD400]" />
                          <h4 className="text-sm font-bold text-white tracking-wide">{item.title}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          item.severity === 'HIGH'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : item.severity === 'MEDIUM'
                            ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                            : 'bg-white/[0.05] text-slate-300 border-white/10'
                        }`}>
                          {item.severity} SEVERITY
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {item.explanation}
                      </p>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Info className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-[11px] text-yellow-400/90 font-bold uppercase">Expected Relationship:</span>
                        </div>
                        <p className="text-[11px] text-slate-300 pl-5">{item.expected_relationship}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                        <span>Rule ID: {item.rule_id}</span>
                        <span>Affected: {item.affected_features.join(', ')}</span>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            ) : result && (
              <GlassCard className="p-8 text-center space-y-3 border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto drop-shadow-[0_0_12px_#34D399]" />
                <h4 className="text-base font-bold text-white">No Telemetry Mismatches</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  The tested session depth, weekly frequency, completion rate, and cumulative watch time maintain statistical coherence consistent with the 2,000-user distribution.
                </p>
              </GlassCard>
            )}

            {/* Disclaimer Footer */}
            {result && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>{result.disclaimer}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
