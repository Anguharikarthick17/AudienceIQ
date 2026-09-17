import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  CheckCircle, XCircle, HardDrive, Layers, BarChart3,
  Target, Users, Clock, FlaskConical
} from 'lucide-react'
import { api, type ModelInfoResponse } from '@/api/client'

export default function ModelEvidence() {
  const [info, setInfo] = useState<ModelInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getModelInfo()
      .then(setInfo)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card h-24 skeleton" />
      ))}
    </div>
  )

  if (error || !info) return (
    <div className="card text-center py-12 text-red-400">
      <XCircle className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">{error || 'Could not load model info'}</p>
    </div>
  )

  const kData = info.k_evaluation?.map(e => ({
    k: `K=${e.k}`,
    silhouette: parseFloat(e.silhouette_score.toFixed(4)),
    inertia: Math.round(e.inertia),
  })) || []

  const STATUS_CONFIGS: Record<string, { color: string; dot: string; label: string }> = {
    trained: { color: 'text-emerald-400', dot: 'status-dot-green', label: 'Trained' },
    not_trained: { color: 'text-amber-400', dot: 'status-dot-amber', label: 'Not Trained' },
    artifact_exists_not_loaded: { color: 'text-blue-400', dot: 'status-dot-amber', label: 'Artifact exists' },
  }

  const statusCfg = STATUS_CONFIGS[info.model_status] || STATUS_CONFIGS['not_trained']

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Model Status', icon: CheckCircle,
            value: statusCfg.label, valueColor: statusCfg.color,
            dot: statusCfg.dot,
          },
          {
            label: 'Selected K', icon: Layers,
            value: info.selected_k !== null && info.selected_k !== undefined ? `K = ${info.selected_k}` : '—',
            valueColor: 'text-brand-400',
          },
          {
            label: 'Silhouette Score', icon: Target,
            value: info.silhouette_score !== null && info.silhouette_score !== undefined
              ? info.silhouette_score.toFixed(4) : '—',
            valueColor: 'text-emerald-400',
          },
          {
            label: 'Inertia', icon: BarChart3,
            value: info.inertia !== null && info.inertia !== undefined
              ? info.inertia.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—',
            valueColor: 'text-slate-300',
          },
          {
            label: 'Training Users', icon: Users,
            value: info.n_training_users?.toLocaleString() ?? '—',
            valueColor: 'text-slate-300',
          },
          {
            label: 'Artifact', icon: HardDrive,
            value: info.artifact_exists ? 'Persisted' : 'Missing',
            valueColor: info.artifact_exists ? 'text-emerald-400' : 'text-red-400',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <div className="flex items-center gap-1.5 mb-2">
              {'dot' in card && <span className={card.dot} />}
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className={`text-lg font-bold tabular-nums ${card.valueColor}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Cluster balance */}
      {info.cluster_balance && info.cluster_balance.length > 0 && (
        <div className="card">
          <p className="section-label mb-4">Cluster Size Distribution</p>
          <div className="flex items-end gap-2 h-24">
            {info.cluster_balance.map((size, i) => {
              const max = Math.max(...info.cluster_balance!)
              const pct = (size / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500">{size.toLocaleString()}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="w-full rounded-t-sm bg-brand-600/80 hover:bg-brand-500 transition-colors"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-slate-500">K{i}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* K evaluation chart */}
      {kData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="section-label mb-4">Silhouette Score vs K</p>
            <p className="text-xs text-slate-500 mb-3">Higher silhouette = better-defined clusters. K is selected at the maximum.</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [v.toFixed(4), 'Silhouette Score']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Line
                  type="monotone" dataKey="silhouette" stroke="#6366f1"
                  strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6, fill: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <p className="section-label mb-4">Inertia (Elbow) vs K</p>
            <p className="text-xs text-slate-500 mb-3">Lower inertia = tighter clusters. The elbow helps guide K selection.</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'Inertia']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Line
                  type="monotone" dataKey="inertia" stroke="#10b981"
                  strokeWidth={2} dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Training info */}
      {info.trained_at && (
        <div className="card">
          <p className="section-label mb-3">Model Details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Trained At</p>
              <p className="text-slate-200 font-mono text-xs mt-0.5">{new Date(info.trained_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Pipeline Path</p>
              <p className="text-slate-200 font-mono text-xs mt-0.5 truncate">{info.pipeline_path}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Algorithm</p>
              <p className="text-slate-200 text-xs mt-0.5">KMeans + StandardScaler (random_state=42)</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">K Selection Method</p>
              <p className="text-slate-200 text-xs mt-0.5">Maximum Silhouette Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
