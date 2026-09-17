import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
  delay?: number
}

export default function GlassCard({
  children,
  className = '',
  glow = false,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`relative rounded-[22px] bg-white/[0.035] backdrop-blur-[20px] 
                 border border-white/[0.09] border-t-white/[0.18] shadow-[0_12px_32px_rgba(0,0,0,0.6)]
                 transition-colors duration-300
                 ${hover ? 'hover:border-yellow-400/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(255,212,0,0.08)]' : ''}
                 ${glow ? 'shadow-[0_0_35px_rgba(255,212,0,0.12)]' : ''}
                 ${className}`}
    >
      {/* Subtle top edge specular highlight */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  )
}
