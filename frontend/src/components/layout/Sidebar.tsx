import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Upload,
  Users,
  UserSearch,
  FlaskConical,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/upload', icon: Upload, label: 'Dataset Upload' },
  { to: '/segments', icon: Users, label: 'Segments' },
  { to: '/analyze', icon: UserSearch, label: 'Analyze User' },
  { to: '/model', icon: FlaskConical, label: 'ML Evidence' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-slate-800 bg-slate-950 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-50 leading-none">AudienceIQ</p>
          <p className="text-[10px] text-slate-500 mt-0.5">OTT Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : ''}`} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Powered by KMeans Clustering<br />
          Explainable AI • No Black Box
        </p>
      </div>
    </aside>
  )
}
