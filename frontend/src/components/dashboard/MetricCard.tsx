import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: string
  icon: LucideIcon
  delay?: number
  isHighlighted?: boolean
}

export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon,
  delay = 0,
  isHighlighted = false,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative rounded-[22px] p-5 overflow-hidden transition-all duration-300
                 bg-white/[0.035] backdrop-blur-[20px] border border-white/[0.09] border-t-white/[0.18]
                 shadow-[0_12px_32px_rgba(0,0,0,0.6)]
                 hover:border-yellow-400/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(255,212,0,0.1)]
                 ${isHighlighted ? 'border-yellow-400/30 shadow-[0_0_25px_rgba(255,212,0,0.08)]' : ''}`}
    >
      {/* Top subtle highlight reflection */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          {/* Label */}
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            {label}
          </p>

          {/* Large Stat Number */}
          <p className="text-3xl font-black text-white mt-1.5 tracking-tight font-mono tabular-nums">
            {value}
          </p>

          {/* Supporting Text & Trend */}
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-400 font-mono bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </span>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 3D-styled Icon Container with Yellow / Chrome Accent */}
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-white/[0.08] to-black/60 
                        border border-white/15 flex items-center justify-center shrink-0 shadow-inner
                        group-hover:border-yellow-400/40 transition-colors">
          <Icon className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,212,0,0.4)]" />
          <div className="absolute inset-0 rounded-2xl bg-yellow-400/10 opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Micro-sparkline / visual indicator bar */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>TELEMETRY VERIFIED</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <span className="text-slate-400">LIVE</span>
        </div>
      </div>
    </motion.div>
  )
}
