import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Upload,
  Users,
  UserSearch,
  FlaskConical,
  Sparkles,
  GitCompare,
  GitCommit,
  Layers,
  HelpCircle,
  Menu,
  X,
  Radio,
} from 'lucide-react'

interface NavGroup {
  title: string
  items: {
    to: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    end?: boolean
    badge?: string
  }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/segments', icon: Users, label: 'Segments' },
      { to: '/analyze', icon: UserSearch, label: 'Analyze User' },
    ],
  },
  {
    title: 'INTELLIGENCE LAB',
    items: [
      { to: '/counterfactual', icon: Sparkles, label: 'Counterfactual Lab', badge: 'LAB' },
      { to: '/contradiction', icon: GitCompare, label: 'Contradiction Detector' },
      { to: '/migration', icon: GitCommit, label: 'Migration Map' },
      { to: '/content-gaps', icon: Layers, label: 'Content Gaps' },
      { to: '/recommendations', icon: HelpCircle, label: 'Recommendations' },
    ],
  },
  {
    title: 'ML SYSTEM',
    items: [
      { to: '/model', icon: FlaskConical, label: 'ML Evidence' },
      { to: '/upload', icon: Upload, label: 'Dataset Upload' },
    ],
  },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080808]/95 backdrop-blur-2xl border-r border-white/[0.08] select-none">
      {/* Brand Monogram Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          {/* 3D Liquid Glass Monogram Logo */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 
                          flex items-center justify-center shadow-[0_0_20px_rgba(255,212,0,0.3)]
                          border border-white/40 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-black text-lg tracking-tight font-mono">A</span>
            <div className="absolute inset-0 rounded-xl bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-wide">AudienceIQ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#FFD400]" />
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TEAM LIQUID</p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {group.title}
            </p>
            {group.items.map(({ to, icon: Icon, label, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-yellow-400' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD400]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Meta */}
      <div className="p-4 border-t border-white/[0.07] bg-black/40">
        <div className="flex items-center gap-2 mb-1.5">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">REST API v1.0</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Explainable Unsupervised KMeans • Zero Black Box
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger Trigger (shown in TopBar or fixed) */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white shadow-lg"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5 text-yellow-400" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
