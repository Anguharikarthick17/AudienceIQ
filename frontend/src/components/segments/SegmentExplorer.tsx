import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Users, TrendingUp, Layers } from 'lucide-react'
import type { SegmentDetail } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'
import SegmentDetailPanel from './SegmentDetail'

interface SegmentExplorerProps {
  segments: SegmentDetail[]
}

const SEGMENT_COLORS = [
  '#FFD400', // Vibrant Gold
  '#EAB308', // Secondary Gold
  '#CA8A04', // Deep Gold
  '#A1A1AA', // Platinum
]

export default function SegmentExplorer({ segments }: SegmentExplorerProps) {
  const [selected, setSelected] = useState<SegmentDetail | null>(segments[0] || null)

  const getEngagementBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Segment List */}
      <div className="xl:col-span-2 space-y-3">
        {segments.map((seg, i) => {
          const isSelected = selected?.segment_id === seg.segment_id
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]

          return (
            <motion.div
              key={seg.segment_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(seg)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border select-none ${
                isSelected
                  ? 'bg-yellow-400/[0.06] border-yellow-400/50 shadow-[0_0_25px_rgba(255,212,0,0.12)]'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-yellow-400/30 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Cohort Color Dot with Glow */}
                <div
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: isSelected ? `0 0 10px ${color}` : undefined,
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white leading-snug truncate">
                      {seg.segment_name}
                    </p>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isSelected ? 'text-yellow-400 rotate-90' : 'text-slate-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3 text-slate-400" />
                      {seg.user_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {seg.audience_pct.toFixed(1)}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEngagementBadge(seg.engagement_level)}`}>
                      {seg.engagement_level.toUpperCase()}
                    </span>
                  </div>

                  {/* Liquid Yellow Progress Bar */}
                  <div className="mt-3.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${seg.audience_pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detail Panel */}
      <div className="xl:col-span-3">
        <AnimatePresence mode="wait">
          {selected ? (
            <SegmentDetailPanel
              key={selected.segment_id}
              segment={selected}
              colorIndex={segments.findIndex(s => s.segment_id === selected.segment_id)}
            />
          ) : (
            <GlassCard className="h-full flex items-center justify-center min-h-[360px] p-8">
              <div className="text-center">
                <Layers className="w-12 h-12 text-yellow-400/40 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Select a segment to explore its profile</p>
              </div>
            </GlassCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
