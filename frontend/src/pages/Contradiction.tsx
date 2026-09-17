import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GitCompare, ShieldAlert, AlertTriangle, CheckCircle, Search, Info, Sliders, ArrowRight
} from 'lucide-react'
import { api, type DashboardResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'

export default function Contradiction() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [testProfile, setTestProfile] = useState({
    watchTime: 120,
    completionRate: 8,
    avgSession: 140,
    sessionsPerWeek: 1,
  })

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => {})
  }, [])

  // Calculate anomaly / contradiction score
  const hasWatchSessionConflict = testProfile.watchTime > 80 && testProfile.sessionsPerWeek < 1.5
  const hasCompletionConflict = testProfile.watchTime > 60 && testProfile.completionRate < 15
  const hasSessionDurationConflict = testProfile.avgSession > 120 && testProfile.watchTime < 10

  const contradictionScore =
    (hasWatchSessionConflict ? 40 : 0) +
    (hasCompletionConflict ? 35 : 0) +
    (hasSessionDurationConflict ? 25 : 0)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Contradiction Detector" subtitle="Behavioral Incoherence & Anomaly Audit" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            <span>BEHAVIORAL INTEGRITY AUDIT</span>
          </div>
          <h1 className="page-title">Contradiction Detector</h1>
          <p className="page-subtitle">
            Detects behavioral incoherence, synthetic telemetry, bot patterns, and telemetry mismatches (e.g. extreme watch hours coupled with near-zero completion or session anomalies).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Profile Tester */}
          <div className="lg:col-span-6 space-y-5">
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <Sliders className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Contradiction Test Profile
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Watch Time:</span>
                    <span className="text-yellow-400 font-bold">{testProfile.watchTime} hours</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={testProfile.watchTime}
                    onChange={e => setTestProfile(p => ({ ...p, watchTime: Number(e.target.value) }))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Completion Rate:</span>
                    <span className="text-yellow-400 font-bold">{testProfile.completionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={testProfile.completionRate}
                    onChange={e => setTestProfile(p => ({ ...p, completionRate: Number(e.target.value) }))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Avg Session Duration:</span>
                    <span className="text-yellow-400 font-bold">{testProfile.avgSession} mins</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    value={testProfile.avgSession}
                    onChange={e => setTestProfile(p => ({ ...p, avgSession: Number(e.target.value) }))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Sessions Per Week:</span>
                    <span className="text-yellow-400 font-bold">{testProfile.sessionsPerWeek}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="14"
                    step="0.5"
                    value={testProfile.sessionsPerWeek}
                    onChange={e => setTestProfile(p => ({ ...p, sessionsPerWeek: Number(e.target.value) }))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Diagnostic Radar & Results */}
          <div className="lg:col-span-6 space-y-5">
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <p className="section-label">Contradiction Diagnostic Score</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  contradictionScore > 50
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : contradictionScore > 20
                    ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {contradictionScore}% CONTRADICTION RISK
                </span>
              </div>

              {/* Visual Meter Bar */}
              <div className="space-y-1.5">
                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                  <motion.div
                    animate={{ width: `${contradictionScore}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      contradictionScore > 50
                        ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_12px_#ef4444]'
                        : contradictionScore > 20
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_12px_#FFD400]'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_#34d399]'
                    }`}
                  />
                </div>
              </div>

              {/* Detected Anomalies List */}
              <div className="space-y-3 pt-2">
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  hasCompletionConflict
                    ? 'bg-red-500/[0.05] border-red-500/25 text-red-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}>
                  {hasCompletionConflict ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-white">High Watch Time with Minimal Completion</p>
                    <p className="mt-0.5 text-slate-400">
                      {hasCompletionConflict
                        ? 'Contradiction: Over 60h logged but <15% completion rate suggests background playback, automated scraping, or UI abandonment.'
                        : 'Passed: Completion rate is proportionally coherent with total consumption.'}
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  hasWatchSessionConflict
                    ? 'bg-yellow-400/[0.05] border-yellow-400/25 text-yellow-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}>
                  {hasWatchSessionConflict ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-white">Frequency vs Volume Incoherence</p>
                    <p className="mt-0.5 text-slate-400">
                      {hasWatchSessionConflict
                        ? 'High hours concentrated into abnormally low weekly sessions implies synthetic bursts or shared-credential usage.'
                        : 'Passed: Session frequency cleanly matches cumulative volume.'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
