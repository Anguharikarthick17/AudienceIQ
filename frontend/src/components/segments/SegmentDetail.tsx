import { motion } from 'framer-motion'
import { Users, Clock, Tv, Lightbulb, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react'
import type { SegmentDetail } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'

const SEGMENT_GRADIENTS = [
  'from-yellow-400 via-amber-500 to-yellow-600',
  'from-amber-400 via-yellow-500 to-amber-600',
  'from-yellow-500 via-amber-600 to-yellow-700',
  'from-zinc-300 via-slate-400 to-zinc-500',
]

interface SegmentDetailProps {
  segment: SegmentDetail
  colorIndex: number
}

export default function SegmentDetail({ segment, colorIndex }: SegmentDetailProps) {
  const gradient = SEGMENT_GRADIENTS[colorIndex % SEGMENT_GRADIENTS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <GlassCard className="p-6 space-y-6">
        {/* Liquid Gold / Black Chrome Banner */}
        <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r ${gradient} text-black shadow-[0_8px_30px_rgba(255,212,0,0.25)]`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black text-black/70 bg-black/10 px-2 py-0.5 rounded">
                COHORT SPECIFICATION
              </span>
              <h3 className="text-2xl font-black tracking-tight text-black mt-1">
                {segment.segment_name}
              </h3>
              <p className="text-xs font-mono text-black/80 mt-0.5">
                Segment Cluster #{segment.segment_id} • Centroid Invariant
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-black/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'AUDIENCE SIZE', value: segment.user_count.toLocaleString() },
            { icon: Tv, label: 'COHORT SHARE', value: `${segment.audience_pct.toFixed(1)}%` },
            { icon: Clock, label: 'AVG SESSION', value: `${segment.avg_session_mins.toFixed(0)}m` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-3.5 text-center">
              <Icon className="w-4 h-4 text-yellow-400 mx-auto mb-1.5 drop-shadow-[0_0_6px_#FFD400]" />
              <p className="text-base font-black text-white font-mono">{value}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Dominant Genres */}
        {segment.dominant_genres.length > 0 && (
          <div>
            <p className="section-label mb-2.5">Dominant Content Affinities</p>
            <div className="flex flex-wrap gap-2">
              {segment.dominant_genres.map(g => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-[0_0_10px_rgba(255,212,0,0.1)]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Characteristics */}
        <div>
          <p className="section-label mb-2.5">Empirical Behavioral Profile</p>
          <div className="space-y-2">
            {segment.engagement_characteristics.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_6px_#34d399]" />
                <span className="leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Strategy */}
        <div className="bg-yellow-400/[0.04] border border-yellow-400/20 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,212,0,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_#FFD400]" />
            <p className="text-xs font-bold font-mono uppercase tracking-wider text-yellow-400">
              Personalization Strategy
            </p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {segment.recommendation_strategy}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
