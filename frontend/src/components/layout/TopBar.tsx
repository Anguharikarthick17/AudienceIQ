import { useEffect, useState } from 'react'
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '@/api/client'

export default function TopBar({ title }: { title: string }) {
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null)

  useEffect(() => {
    api.health()
      .then(h => setModelLoaded(h.model_loaded))
      .catch(() => setModelLoaded(false))
  }, [])

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm
                       flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Model status pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800
                        rounded-full px-3 py-1.5">
          {modelLoaded === null ? (
            <>
              <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin" />
              <span className="text-xs text-slate-500">Checking…</span>
            </>
          ) : modelLoaded ? (
            <>
              <span className="status-dot-green" />
              <span className="text-xs text-emerald-400 font-medium">Model Ready</span>
            </>
          ) : (
            <>
              <span className="status-dot-amber" />
              <span className="text-xs text-amber-400 font-medium">No Model</span>
            </>
          )}
        </div>

        <Activity className="w-4 h-4 text-slate-600" />
      </div>
    </header>
  )
}
