import { Github, FileText, Sparkles } from 'lucide-react'
import StatusPill from '@/components/common/StatusPill'
import GlassButton from '@/components/common/GlassButton'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-16 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl
                       flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-10 select-none">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">{title}</h1>
            <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
              PRO
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real Live Model Status Pill */}
        <StatusPill />

        {/* Quick External Actions */}
        <a
          href="https://github.com/Anguharikarthick17/AudienceIQ"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository"
        >
          <GlassButton variant="icon" aria-label="GitHub Repository">
            <Github className="w-4 h-4" />
          </GlassButton>
        </a>

        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          title="FastAPI OpenAPI Docs"
        >
          <GlassButton variant="icon" aria-label="API Documentation">
            <FileText className="w-4 h-4" />
          </GlassButton>
        </a>
      </div>
    </header>
  )
}
