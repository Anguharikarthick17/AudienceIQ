import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GitCommit, ArrowRight, TrendingUp, Users, Compass, Sparkles, Activity
} from 'lucide-react'
import { api, type SegmentDetail } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'

export default function Migration() {
  const [segments, setSegments] = useState<SegmentDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSegments()
      .then(setSegments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Migration Map" subtitle="Cross-Cohort Mobility & Retention Vectors" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <GitCommit className="w-3.5 h-3.5" />
            <span>AUDIENCE MOBILITY DYNAMICS</span>
          </div>
          <h1 className="page-title">Cohort Migration Map</h1>
          <p className="page-subtitle">
            Visualize how viewer cohorts transition between low, medium, and high engagement states as consumption habits, content completions, and session depths evolve over time.
          </p>
        </div>

        {/* 3D Cohort Transition Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((seg, i) => (
            <GlassCard key={seg.segment_id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD400]" />
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Cohort #{seg.segment_id}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{seg.segment_name}</h3>
                  <p className="text-xs font-mono text-yellow-400 mt-0.5">
                    {seg.audience_pct.toFixed(1)}% of total platform audience ({seg.user_count.toLocaleString()} viewers)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/[0.04] text-white border border-white/10">
                  {seg.engagement_level.toUpperCase()}
                </span>
              </div>

              {/* Migration Threshold Telemetry */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>Avg Watch Time Baseline:</span>
                  <span className="text-white font-bold">{seg.avg_watch_time.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>Session Length Baseline:</span>
                  <span className="text-white font-bold">{seg.avg_session_mins.toFixed(0)} mins</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>Migration Sensitivity:</span>
                  <span className="text-yellow-400 font-bold">
                    {seg.engagement_level === 'High' ? 'Retention Target (Anchor)' : 'Upward Vector to Cohort 1'}
                  </span>
                </div>
              </div>

              {/* Migration Strategy Vector */}
              <div className="pt-2">
                <p className="text-[11px] font-mono uppercase text-yellow-400 font-bold mb-1">
                  Migration Catalyst Strategy:
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {seg.recommendation_strategy}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Transition Pipeline Vector Visualizer */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#FFD400]" />
            <p className="section-label text-white">Cohort Transition Vector Highway</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Origin State</span>
              <p className="text-base font-bold text-white">Casual & Low Engagement Streamers</p>
              <p className="text-xs text-slate-400 font-mono">Short sessions • High churn risk</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-12 sm:w-24 h-0.5 bg-gradient-to-r from-yellow-400/20 via-yellow-400 to-yellow-400/20" />
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-[9px] font-mono text-yellow-400 uppercase font-bold">+18.5h threshold</span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold">Target Cohort</span>
              <p className="text-base font-bold text-white">High-Retention OTT Enthusiasts</p>
              <p className="text-xs text-slate-400 font-mono">Long sessions • High LTV</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
