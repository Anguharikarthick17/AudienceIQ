import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Users, Clock, Tv, TrendingUp } from 'lucide-react'
import type { SegmentDetail } from '@/api/client'
import SegmentDetailPanel from './SegmentDetail'

interface SegmentExplorerProps {
  segments: SegmentDetail[]
}

const ENGAGEMENT_COLORS: Record<string, string> = {
  High: 'badge-green',
  Medium: 'badge-brand',
  Low: 'badge-amber',
}

const SEGMENT_COLORS = [
  'bg-brand-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-pink-500', 'bg-teal-500',
]

export default function SegmentExplorer({ segments }: SegmentExplorerProps) {
  const [selected, setSelected] = useState<SegmentDetail | null>(null)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Segment list */}
      <div className="xl:col-span-2 space-y-3">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.segment_id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`card cursor-pointer transition-all duration-200 hover:border-slate-600
                       ${selected?.segment_id === seg.segment_id ? 'border-brand-500/50 bg-brand-500/5' : ''}`}
            onClick={() => setSelected(seg)}
          >
            <div className="flex items-start gap-3">
              {/* Color dot */}
              <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100 leading-snug">{seg.segment_name}</p>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-200 ${selected?.segment_id === seg.segment_id ? 'text-brand-400 rotate-90' : 'text-slate-600'}`} />
                </div>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    {seg.user_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <TrendingUp className="w-3 h-3" />
                    {seg.audience_pct}%
                  </span>
                  <span className={ENGAGEMENT_COLORS[seg.engagement_level] || 'badge-brand'}>
                    {seg.engagement_level}
                  </span>
                </div>

                {/* Audience bar */}
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.audience_pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 + 0.2 }}
                    className={`h-full rounded-full ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <div className="xl:col-span-3">
        <AnimatePresence mode="wait">
          {selected ? (
            <SegmentDetailPanel key={selected.segment_id} segment={selected} colorIndex={segments.findIndex(s => s.segment_id === selected.segment_id)} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card h-full flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center">
                <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Select a segment to explore its profile</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
