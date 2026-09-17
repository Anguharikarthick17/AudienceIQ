import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle, Lightbulb, CheckCircle, ShieldCheck, Sparkles, Sliders, Cpu, ArrowRight
} from 'lucide-react'
import { api, type SegmentDetail } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'

export default function RecommendationsPage() {
  const [segments, setSegments] = useState<SegmentDetail[]>([])
  const [selectedSegment, setSelectedSegment] = useState<SegmentDetail | null>(null)

  useEffect(() => {
    api.getSegments().then(s => {
      setSegments(s)
      if (s.length > 0) setSelectedSegment(s[0])
    }).catch(() => {})
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Recommendation Intelligence" subtitle="Explainable Rule-Based Content Logic" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>TRANSPARENT REASONING ENGINE</span>
          </div>
          <h1 className="page-title">Recommendation Intelligence</h1>
          <p className="page-subtitle">
            Zero hallucinations, zero hidden weights. Inspect explicit rule-based recommendation logic tied directly to audience cohort characteristics, engagement tiers, and genre affinities.
          </p>
        </div>

        {/* Rule Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <span className="font-mono font-bold text-yellow-400 text-sm">01</span>
            </div>
            <h3 className="text-base font-bold text-white">Genre Intersection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalized candidate items are ranked first by matching the viewer's explicit primary genres against cohort dominant preferences.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <span className="font-mono font-bold text-yellow-400 text-sm">02</span>
            </div>
            <h3 className="text-base font-bold text-white">Engagement Adaptation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Session length regulates duration recommendations: shorter formats for casual viewers, serialized epics for high-engagement cohorts.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <span className="font-mono font-bold text-yellow-400 text-sm">03</span>
            </div>
            <h3 className="text-base font-bold text-white">Explicit Rationale Trace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every recommendation outputs a traceable human-readable rationale explaining precisely which behavioral signal triggered the suggestion.
            </p>
          </GlassCard>
        </div>

        {/* Interactive Cohort Recommendation Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <p className="section-label">Select Cohort Policy</p>
            {segments.map(seg => {
              const isSelected = selectedSegment?.segment_id === seg.segment_id
              return (
                <div
                  key={seg.segment_id}
                  onClick={() => setSelectedSegment(seg)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'bg-yellow-400/[0.06] border-yellow-400/50 shadow-[0_0_20px_rgba(255,212,0,0.1)]'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-yellow-400/30'
                  }`}
                >
                  <p className="text-sm font-bold text-white">{seg.segment_name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-400">
                    <span>ID #{seg.segment_id}</span>
                    <span>•</span>
                    <span className="text-yellow-400 font-bold">{seg.engagement_level} Engagement</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-7">
            {selectedSegment && (
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <p className="section-label">Active Personalization Rules</p>
                  <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/25">
                    COHORT #{selectedSegment.segment_id}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">{selectedSegment.segment_name}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Avg Session: {selectedSegment.avg_session_mins.toFixed(0)}m • Avg Watch: {selectedSegment.avg_watch_time.toFixed(1)}h
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <p className="text-xs font-mono font-bold text-yellow-400 uppercase">Core Strategy Statement:</p>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {selectedSegment.recommendation_strategy}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase mb-2">Dominant Genre Weights:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSegment.dominant_genres.map(g => (
                      <span key={g} className="badge-yellow text-xs font-mono font-bold">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
