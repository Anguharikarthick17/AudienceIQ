import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { api, isApiUnavailable, type HealthResponse } from '@/api/client'

export default function StatusPill() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [status, setStatus] = useState<'checking' | 'ready' | 'no_model' | 'offline'>('checking')

  useEffect(() => {
    api.health()
      .then(h => {
        setHealth(h)
        setStatus(h.model_loaded ? 'ready' : 'no_model')
      })
      .catch(e => {
        if (isApiUnavailable(e)) {
          setStatus('offline')
        } else {
          setStatus('no_model')
        }
      })
  }, [])

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full 
                    bg-white/[0.035] backdrop-blur-md border border-white/[0.10]
                    shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {status === 'checking' && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span className="text-xs font-mono text-slate-400">CONNECTING</span>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="text-xs font-bold tracking-wider text-emerald-400 font-mono">
            MODEL READY
          </span>
          <div className="h-3 w-[1px] bg-white/15" />
          <span className="text-[11px] font-mono text-slate-400">
            {health?.n_training_users ? `${health.n_training_users.toLocaleString()} viewers` : '2,000 viewers'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] font-mono text-yellow-400">
            {health?.n_clusters ? `${health.n_clusters} segments` : '2 segments'}
          </span>
        </div>
      )}

      {status === 'no_model' && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span className="text-xs font-bold tracking-wider text-amber-400 font-mono">
            NO MODEL
          </span>
          <div className="h-3 w-[1px] bg-white/15" />
          <span className="text-[11px] text-slate-400">Upload dataset to train</span>
        </div>
      )}

      {status === 'offline' && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
          <span className="text-xs font-bold tracking-wider text-red-400 font-mono">
            API OFFLINE
          </span>
        </div>
      )}
    </div>
  )
}
