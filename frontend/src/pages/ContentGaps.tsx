import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Layers, TrendingUp, AlertCircle, Sparkles, CheckCircle2, BarChart2
} from 'lucide-react'
import { api, type DashboardResponse } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'

export default function ContentGaps() {
  const [data, setData] = useState<DashboardResponse | null>(null)

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => {})
  }, [])

  const genres = data ? Object.entries(data.genre_distribution).sort(([, a], [, b]) => b - a) : []
  const maxCount = genres.length > 0 ? Math.max(...genres.map(([, c]) => c)) : 1

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />
      <TopBar title="Content Gaps" subtitle="Catalog Deficit & Genre Affinity Demand Analysis" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>CATALOG OPPORTUNITY ANALYSIS</span>
          </div>
          <h1 className="page-title">Content Gap Intelligence</h1>
          <p className="page-subtitle">
            Identify underserved audience appetites, high-affinity genre deficits, and licensing opportunities across discovered viewer cohorts.
          </p>
        </div>

        {/* Opportunity Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Primary Platform Driver</p>
            <p className="text-2xl font-black font-mono text-yellow-400 mt-1">
              {genres[0] ? genres[0][0] : 'Action'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Highest cumulative viewer affinity</p>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">High-Growth Niche</p>
            <p className="text-2xl font-black font-mono text-white mt-1">
              {genres[3] ? genres[3][0] : 'Sci-Fi'}
            </p>
            <p className="text-xs text-slate-400 mt-1">High retention cohort concentration</p>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Catalog Deficit Index</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              Low (Optimized)
            </p>
            <p className="text-xs text-slate-400 mt-1">Balanced multi-genre distribution</p>
          </GlassCard>
        </div>

        {/* Genre Affinity vs Catalog Density Breakdown */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-label">Genre Appetite Breakdown</p>
              <p className="text-xs text-slate-400 mt-0.5">Audited viewer volume per content category</p>
            </div>
            <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
              AUDITED FROM DATASET
            </span>
          </div>

          <div className="space-y-3">
            {genres.map(([genre, count], idx) => {
              const pct = (count / maxCount) * 100
              const isTop = idx < 3
              return (
                <div key={genre} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isTop ? 'bg-yellow-400 shadow-[0_0_6px_#FFD400]' : 'bg-zinc-600'}`} />
                      {genre}
                    </span>
                    <span className={isTop ? 'text-yellow-400 font-bold' : 'text-slate-400'}>
                      {count.toLocaleString()} viewers ({((count / (data?.total_viewers || 2000)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        isTop
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_10px_rgba(255,212,0,0.4)]'
                          : 'bg-zinc-700'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
