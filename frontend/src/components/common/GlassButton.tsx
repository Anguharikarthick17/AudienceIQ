import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  disabled?: boolean
}

export default function GlassButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-2xl',
  }

  if (variant === 'primary') {
    return (
      <motion.button
        whileHover={!disabled ? { y: -2, scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        disabled={disabled}
        className={`relative inline-flex items-center justify-center gap-2 font-bold select-none
                   bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black
                   border border-white/40 shadow-[0_4px_20px_rgba(255,212,0,0.32),inset_0_1px_0_rgba(255,255,255,0.6)]
                   hover:shadow-[0_8px_30px_rgba(255,212,0,0.5),0_0_25px_rgba(255,212,0,0.4)]
                   hover:brightness-105 active:brightness-95
                   disabled:opacity-50 disabled:cursor-not-allowed
                   ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    )
  }

  if (variant === 'secondary') {
    return (
      <motion.button
        whileHover={!disabled ? { y: -2, scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        disabled={disabled}
        className={`relative inline-flex items-center justify-center gap-2 font-medium select-none
                   bg-white/[0.04] backdrop-blur-md text-white
                   border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.5)]
                   hover:border-yellow-400/60 hover:text-yellow-400 hover:bg-white/[0.08]
                   hover:shadow-[0_6px_22px_rgba(0,0,0,0.6),0_0_18px_rgba(255,212,0,0.2)]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    )
  }

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={!disabled ? { y: -1, scale: 1.06 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.18 }}
        disabled={disabled}
        className={`w-10 h-10 rounded-full inline-flex items-center justify-center
                   bg-white/[0.04] backdrop-blur-md text-slate-300
                   border border-white/[0.12]
                   hover:border-yellow-400/60 hover:text-yellow-400 hover:bg-white/[0.08]
                   hover:shadow-[0_0_16px_rgba(255,212,0,0.25)]
                   disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <motion.button
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium text-slate-400 hover:text-white
                 hover:bg-white/[0.04] rounded-xl transition-colors ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
