import { ServerOff, Radio } from 'lucide-react'
import GlassCard from './GlassCard'

interface ApiUnavailableStateProps {
  title?: string
  message?: string
}

export default function ApiUnavailableState({
  title = 'FastAPI Backend Connecting or Offline',
  message = 'Connect a deployed AudienceIQ API to load live analytics and model telemetry.',
}: ApiUnavailableStateProps) {
  return (
    <GlassCard className="text-center py-16 px-6 max-w-xl mx-auto my-8">
      <div className="w-14 h-14 rounded-3xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,212,0,0.15)]">
        <ServerOff className="w-7 h-7 text-yellow-400" />
      </div>
      <p className="text-lg font-bold text-white tracking-tight">{title}</p>
      <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">{message}</p>
      <div className="mt-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] inline-block text-left text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-white font-bold">API Connection Config:</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Set <code className="bg-black/60 border border-yellow-400/30 px-1.5 py-0.5 rounded text-yellow-400 font-bold">VITE_API_URL</code> to point to your deployed Render or local FastAPI service.
        </p>
      </div>
    </GlassCard>
  )
}
