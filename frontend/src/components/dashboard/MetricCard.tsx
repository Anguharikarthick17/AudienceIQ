import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

export default function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-400',
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="metric-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon className="w-4.5 h-4.5" size={18} />
        </div>
      </div>
    </motion.div>
  )
}
