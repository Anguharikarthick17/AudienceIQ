import { motion } from 'framer-motion'

interface Floating3DCubesProps {
  size?: number
  className?: string
}

export default function Floating3DCubes({ size = 260, className = '' }: Floating3DCubesProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 212, 0, 0.14) 0%, rgba(234, 179, 8, 0.04) 50%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Floating Center Glass Cube (CSS 3D perspective) */}
      <div
        className="relative"
        style={{
          perspective: 800,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          animate={{
            rotateX: [18, -18, 18],
            rotateY: [-25, 25, -25],
            rotateZ: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-28 h-28 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(20, 20, 20, 0.75) 50%, rgba(0, 0, 0, 0.95) 100%)',
            border: '1px solid rgba(255, 212, 0, 0.45)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), inset 0 2px 10px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 212, 0, 0.25)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Inner holographic wireframe */}
          <div className="w-16 h-16 rounded-xl border border-dashed border-yellow-400/50 flex items-center justify-center bg-yellow-400/[0.04]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_15px_#FFD400]"
            />
          </div>

          {/* Top Edge Specular Reflection */}
          <div className="absolute top-1 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </motion.div>
      </div>

      {/* Orbiting Satellite Micro-Cube 1 */}
      <motion.div
        animate={{
          x: [0, 45, 0, -45, 0],
          y: [-45, 0, 45, 0, -45],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,212,0,0.18)]"
      >
        <span className="text-[10px] font-mono font-bold text-yellow-400">ΔX</span>
      </motion.div>

      {/* Orbiting Satellite Micro-Cube 2 */}
      <motion.div
        animate={{
          x: [0, -40, 0, 40, 0],
          y: [40, 0, -40, 0, 40],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-6 right-6 w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_18px_rgba(255,212,0,0.25)]"
      >
        <span className="text-[9px] font-mono font-bold text-white">k*</span>
      </motion.div>
    </div>
  )
}
