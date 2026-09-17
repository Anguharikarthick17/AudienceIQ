import { motion } from 'framer-motion'

interface Audience3DOrbProps {
  className?: string
  size?: number
}

export default function Audience3DOrb({ className = '', size = 320 }: Audience3DOrbProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background radial ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 212, 0, 0.15) 0%, rgba(234, 179, 8, 0.05) 45%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Outer Counter-Rotating Orbital Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-dashed border-yellow-400/20 pointer-events-none"
        style={{
          boxShadow: '0 0 20px rgba(255, 212, 0, 0.08)',
        }}
      >
        {/* Floating node on Ring 1 */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_12px_#FFD400]" />
      </motion.div>

      {/* Tilted Elliptical Orbital Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full border border-yellow-500/30 pointer-events-none"
        style={{
          width: size * 0.9,
          height: size * 0.45,
          transform: 'rotate(-25deg)',
          boxShadow: 'inset 0 0 15px rgba(255, 212, 0, 0.15)',
        }}
      >
        {/* Orbiting particle A */}
        <div className="absolute top-1 right-12 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_10px_#FFD400]" />
        {/* Orbiting particle B */}
        <div className="absolute bottom-2 left-10 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
      </motion.div>

      {/* Tilted Elliptical Orbital Ring 3 (Orthogonal) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full border border-white/20 pointer-events-none"
        style={{
          width: size * 0.85,
          height: size * 0.4,
          transform: 'rotate(55deg)',
        }}
      >
        <div className="absolute top-0 left-16 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD400]" />
      </motion.div>

      {/* Central Black Chrome & Liquid Glass 3D Sphere */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-full flex items-center justify-center shadow-2xl"
        style={{
          width: size * 0.52,
          height: size * 0.52,
          background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.25) 0%, rgba(40, 40, 40, 0.8) 40%, #050505 85%, #000000 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), inset 0 2px 8px rgba(255, 255, 255, 0.4), 0 0 35px rgba(255, 212, 0, 0.15)',
        }}
      >
        {/* Inner geometric audience network mesh */}
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 opacity-80">
          <defs>
            <linearGradient id="yellowLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD400" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Constellation lines */}
          <line x1="30" y1="25" x2="68" y2="35" stroke="url(#yellowLine)" strokeWidth="1" />
          <line x1="68" y1="35" x2="75" y2="70" stroke="url(#yellowLine)" strokeWidth="1" />
          <line x1="75" y1="70" x2="35" y2="75" stroke="url(#yellowLine)" strokeWidth="1" />
          <line x1="35" y1="75" x2="30" y2="25" stroke="url(#yellowLine)" strokeWidth="1" />
          <line x1="30" y1="25" x2="50" y2="50" stroke="#FFD400" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="68" y1="35" x2="50" y2="50" stroke="#FFD400" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="75" y1="70" x2="50" y2="50" stroke="#FFD400" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="35" y1="75" x2="50" y2="50" stroke="#FFD400" strokeWidth="1.2" strokeOpacity="0.6" />

          {/* Central Centroid Node */}
          <circle cx="50" cy="50" r="5" fill="#FFD400" filter="drop-shadow(0 0 6px #FFD400)" />
          {/* Peripheral Audience Cluster Nodes */}
          <circle cx="30" cy="25" r="3.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="68" cy="35" r="4" fill="#FFD400" />
          <circle cx="75" cy="70" r="3" fill="#EAB308" />
          <circle cx="35" cy="75" r="3.5" fill="#FFFFFF" opacity="0.8" />
        </svg>

        {/* Top-edge glassy specular reflection */}
        <div
          className="absolute top-2 left-6 right-6 h-6 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, transparent 100%)',
            filter: 'blur(1px)',
          }}
        />
      </motion.div>

      {/* Floating 3D Micro-Nodes */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 left-6 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/15 backdrop-blur-md text-[10px] font-mono text-yellow-400 shadow-[0_0_15px_rgba(255,212,0,0.15)] flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span>K=2 OPTIMAL</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-6 right-4 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/15 backdrop-blur-md text-[10px] font-mono text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        <span>SILHOUETTE 0.574</span>
      </motion.div>
    </div>
  )
}
