import { motion } from 'framer-motion'
import { Users, Clock, Tv, Lightbulb, CheckCircle } from 'lucide-react'
import type { SegmentDetail } from '@/api/client'

const SEGMENT_COLORS = [
  'from-brand-500 to-violet-500',
  'from-violet-500 to-cyan-500',
  'from-cyan-500 to-emerald-500',
  'from-emerald-500 to-amber-500',
  'from-amber-500 to-rose-500',
]

interface SegmentDetailProps {
  segment: SegmentDetail
  colorIndex: number
}

export default function SegmentDetail({ segment, colorIndex }: SegmentDetailProps) {
  const gradient = SEGMENT_COLORS[colorIndex % SEGMENT_COLORS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="card space-y-5"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} p-4 rounded-xl -m-5 mb-0`}>
        <h3 className="text-lg font-bold text-white">{segment.segment_name}</h3>
        <p className="text-sm text-white/70 mt-0.5">Segment ID #{segment.segment_id}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { icon: Users, label: 'Users', value: segment.user_count.toLocaleString() },
          { icon: Tv, label: 'Audience', value: `${segment.audience_pct}%` },
          { icon: Clock, label: 'Avg Session', value: `${segment.avg_session_mins.toFixed(0)}m` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-slate-800/60 rounded-lg p-3 text-center">
            <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-slate-100">{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Dominant genres */}
      {segment.dominant_genres.length > 0 && (
        <div>
          <p className="section-label mb-2">Dominant Genres</p>
          <div className="flex flex-wrap gap-2">
            {segment.dominant_genres.map(g => (
              <span key={g} className="badge-brand">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Engagement characteristics */}
      <div>
        <p className="section-label mb-2">Behavioral Profile</p>
        <ul className="space-y-1.5">
          {segment.engagement_characteristics.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation strategy */}
      <div className="bg-brand-500/8 border border-brand-500/15 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="w-4 h-4 text-brand-400" />
          <p className="text-xs font-semibold text-brand-300">Recommendation Strategy</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{segment.recommendation_strategy}</p>
      </div>
    </motion.div>
  )
}
