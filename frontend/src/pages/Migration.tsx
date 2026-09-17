import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GitCommit,
  ArrowRight,
  Sparkles,
  Info,
  Shield,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { api, formatErrorMessage, type MigrationResponse, type MigrationPathway } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'

export default function Migration() {
  const [data, setData] = useState<MigrationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPathway, setSelectedPathway] = useState<MigrationPathway | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getMigration()
      .then(res => {
        setData(res)
        if (res.pathways && res.pathways.length > 0) {
          setSelectedPathway(res.pathways[0])
        }
      })
      .catch(err => setError(formatErrorMessage(err, 'Failed to load migration data')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Audience Migration Map" subtitle="Counterfactual Cohort Boundary Mobility" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* Header Banner */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.12] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <GitCommit className="w-3.5 h-3.5" />
                <span>COUNTERFACTUAL TRANSITION VECTORS</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Audience Migration Map</h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Audited behavioral vectors modeling what behavioral changes shift viewer profiles across KMeans decision boundaries.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 text-[11px] font-mono font-bold tracking-wider shadow-[0_0_15px_rgba(255,212,0,0.2)]">
                SIMULATED TRANSITION — NOT HISTORICAL MIGRATION
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Temporal fields not present in supplied dataset
              </span>
            </div>
          </div>
        </section>

        {/* Data Limitation Transparency Alert */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-bold">Data Transparency Notice: </span>
            <span>
              {data?.data_limitation_notice || 'Temporal timestamps or longitudinal history are not present in the supplied dataset. Migration pathways shown are counterfactual simulations based on KMeans centroid boundaries.'}
            </span>
          </div>
        </div>

        {/* Interactive Node and Flow Visualization */}
        <GlassCard className="p-8 lg:p-10 space-y-8 border-yellow-400/30 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide font-mono uppercase">
                COHORT TRANSITION HIGHWAY
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover or click pathways to inspect required feature shifts and transition rates
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-yellow-400 text-black">
              KMEANS CENTROID VECTORS
            </span>
          </div>

          {/* 3D Flow Nodes Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center py-6">
            {/* NODE A: GENRE EXPLORERS */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-400 border border-white/10">
                  COHORT 1 (57.3%)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              </div>
              <h4 className="text-lg font-black text-white">Genre Explorers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                1,146 viewers • Casual session baseline (34.6m) • 30.3h avg watch time
              </p>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Centroid WT:</span>
                  <span className="text-white font-bold">30.28h</span>
                </div>
                <div className="flex justify-between">
                  <span>Centroid Session:</span>
                  <span className="text-white font-bold">34.63m</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE FLOW PATHWAY CONNECTORS */}
            <div className="md:col-span-3 flex flex-col items-center justify-center gap-4 py-4">
              {data?.pathways.map((p, idx) => {
                const isSelected = selectedPathway?.transition_type === p.transition_type
                const isUp = p.source_segment_id === 1

                return (
                  <button
                    key={p.transition_type}
                    onClick={() => setSelectedPathway(p)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-yellow-400/[0.08] border-yellow-400 shadow-[0_0_20px_rgba(255,212,0,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-yellow-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                        {isUp ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{isUp ? 'Escalation Flow' : 'Decay Flow'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-400 font-bold">
                        {p.simulated_transition_rate}%
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">
                      Simulated: {p.simulated_users_count} viewers
                    </p>
                  </button>
                )
              })}
            </div>

            {/* NODE B: HIGH-ENGAGEMENT GENRE EXPLORERS */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-yellow-400/[0.03] border border-yellow-400/40 shadow-[0_0_30px_rgba(255,212,0,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                  COHORT 0 (42.7%)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD400]" />
              </div>
              <h4 className="text-lg font-black text-yellow-400">High-Engagement Genre Explorers</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                854 viewers • Deep session baseline (112.0m) • 102.3h avg watch time
              </p>
              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Centroid WT:</span>
                  <span className="text-yellow-400 font-bold">102.35h</span>
                </div>
                <div className="flex justify-between">
                  <span>Centroid Session:</span>
                  <span className="text-yellow-400 font-bold">112.02m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pathway Inspection Detail Box */}
          {selectedPathway && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-black/60 border border-yellow-400/30 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    {selectedPathway.transition_type} Vector Analysis
                  </span>
                </div>
                <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                  SIMULATION AUDIT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Source</span>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedPathway.source_segment_name}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Destination</span>
                  <p className="text-xs font-bold text-yellow-400 mt-0.5">{selectedPathway.target_segment_name}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated Count</span>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedPathway.simulated_users_count} viewers</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Transition Rate</span>
                  <p className="text-xs font-bold text-yellow-400 mt-0.5">{selectedPathway.simulated_transition_rate}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <p className="text-[11px] font-mono text-yellow-400 font-bold uppercase">Required Behavioral Delta:</p>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {selectedPathway.explanation}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(selectedPathway.feature_shifts).map(([k, v]) => (
                    <span key={k} className="px-2.5 py-1 rounded bg-white/[0.04] text-[11px] font-mono text-slate-300 border border-white/10">
                      {k}: <span className="text-yellow-400 font-bold">{v > 0 ? `+${v}` : v}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
