import { ServerOff } from 'lucide-react'

interface ApiUnavailableStateProps {
  title?: string
  message?: string
}

export default function ApiUnavailableState({
  title = 'Backend API unavailable',
  message = 'Connect a deployed AudienceIQ API to load live analytics.',
}: ApiUnavailableStateProps) {
  return (
    <div className="card text-center py-16">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <ServerOff className="w-6 h-6 text-amber-400" />
      </div>
      <p className="text-base font-semibold text-slate-200">{title}</p>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{message}</p>
      <p className="text-xs text-slate-500 mt-4">
        Set <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-[11px]">VITE_API_URL</code> in your deployment environment settings to connect your live FastAPI backend.
      </p>
    </div>
  )
}
