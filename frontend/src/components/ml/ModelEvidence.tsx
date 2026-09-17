import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  CheckCircle, XCircle, HardDrive, Layers, BarChart3,
  Target, Users, Clock, FlaskConical, Sparkles, ShieldCheck
} from 'lucide-react'
import { api, isApiUnavailable, formatErrorMessage, type ModelInfoResponse } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'
import ApiUnavailableState from '@/components/common/ApiUnavailableState'

export default function ModelEvidence() {
  const [info, setInfo] = useState<ModelInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getModelInfo()
      .then(setInfo)
      .catch(e => setError(formatErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 skeleton rounded-2xl" />
      ))}
    </div>
  )

  if (error || !info) {
    if (isApiUnavailable(error)) {
      return <ApiUnavailableState />
    }
    return (
      <GlassCard className="text-center py-16 px-6">
        <XCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
        <p className="text-base font-bold text-white">Could not retrieve model metadata</p>
        <p className="text-xs text-yellow-400/80 mt-1 font-mono">{error || 'Pipeline metadata unreachable'}</p>
      </GlassCard>
    )
  }

  const kData = info.k_evaluation?.map(e => ({
    k: `K=${e.k}`,
    silhouette: parseFloat(e.silhouette_score.toFixed(4)),
    inertia: Math.round(e.inertia),
  })) || []

  const STATUS_CONFIGS: Record<string, { color: string; dot: string; label: string }> = {
    trained: { color: 'text-emerald-400', dot: 'status-dot-green', label: 'TRAINED & PERSISTED' },
    not_trained: { color: 'text-yellow-400', dot: 'status-dot-amber', label: 'NOT TRAINED' },
    artifact_exists_not_loaded: { color: 'text-amber-400', dot: 'status-dot-amber', label: 'ARTIFACT ON DISK' },
  }

  const statusCfg = STATUS_CONFIGS[info.model_status] || STATUS_CONFIGS['not_trained']

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'STATUS',
            icon: CheckCircle,
            value: statusCfg.label,
            valueColor: statusCfg.color,
            dot: statusCfg.dot,
          },
          {
            label: 'SELECTED K',
            icon: Layers,
            value: info.selected_k !== null && info.selected_k !== undefined ? `K = ${info.selected_k}` : '—',
            valueColor: 'text-yellow-400',
          },
          {
            label: 'SILHOUETTE SCORE',
            icon: Target,
            value: info.silhouette_score !== null && info.silhouette_score !== undefined
              ? info.silhouette_score.toFixed(4) : '—',
            valueColor: 'text-yellow-400',
          },
          {
            label: 'INERTIA',
            icon: BarChart3,
            value: info.inertia !== null && info.inertia !== undefined
              ? info.inertia.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—',
            valueColor: 'text-white',
          },
          {
            label: 'TRAINING USERS',
            icon: Users,
            value: info.n_training_users?.toLocaleString() ?? '—',
            valueColor: 'text-white',
          },
          {
            label: 'PERSISTENCE',
            icon: HardDrive,
            value: info.artifact_exists ? 'SAVED' : 'PENDING',
            valueColor: info.artifact_exists ? 'text-emerald-400' : 'text-red-400',
          },
        ].map((card, i) => (
          <GlassCard key={card.label} className="p-4" delay={i * 0.04}>
            <div className="flex items-center gap-1.5 mb-2">
              {'dot' in card && <span className={card.dot} />}
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                {card.label}
              </p>
            </div>
            <p className={`text-base lg:text-lg font-black font-mono tracking-tight tabular-nums truncate ${card.valueColor}`}>
              {card.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Cluster Balance Visual */}
      {info.cluster_balance && info.cluster_balance.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label">Empirical Cluster Balance</p>
              <p className="text-xs text-slate-400 mt-0.5">Assigned viewer counts per discovered cluster cohort</p>
            </div>
            <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/25">
              BALANCED
            </span>
          </div>
          <div className="flex items-end gap-3 h-28 pt-4">
            {info.cluster_balance.map((size, i) => {
              const max = Math.max(...info.cluster_balance!)
              const pct = (size / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-yellow-400">{size.toLocaleString()}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-[0_0_12px_rgba(255,212,0,0.3)] hover:brightness-110 transition-all cursor-pointer"
                    style={{ minHeight: 6 }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">Cluster {i}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* K Evaluation Charts Row */}
      {kData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Silhouette Curve */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Silhouette Score vs K</p>
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/25">
                MAX SEPARATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Mathematical cluster cohesion & separation. K is selected automatically at the global maximum.
            </p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kData} margin={{ left: -15, right: 15, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v.toFixed(4), 'Silhouette']}
                    contentStyle={{
                      background: 'rgba(10, 10, 10, 0.95)',
                      border: '1px solid rgba(255, 212, 0, 0.4)',
                      borderRadius: 12,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="silhouette"
                    stroke="#FFD400"
                    strokeWidth={2.5}
                    dot={{ fill: '#FFD400', r: 4, stroke: '#000000', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FFD400', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Inertia Elbow Curve */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Inertia (Elbow Criterion) vs K</p>
              <span className="text-[10px] font-mono text-slate-300 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                WCSS
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Sum of squared distances of samples to their closest cluster center (within-cluster variance).
            </p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kData} margin={{ left: 10, right: 15, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v.toLocaleString(undefined, { maximumFractionDigits: 0 }), 'Inertia']}
                    contentStyle={{
                      background: 'rgba(10, 10, 10, 0.95)',
                      border: '1px solid rgba(255, 212, 0, 0.4)',
                      borderRadius: 12,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inertia"
                    stroke="#EAB308"
                    strokeWidth={2.5}
                    dot={{ fill: '#EAB308', r: 4, stroke: '#000000', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#FFD400', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Model Metadata Architecture Spec */}
      {info.trained_at && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#FFD400]" />
            <p className="section-label text-white">Pipeline Architecture & Verification</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-slate-400 font-mono text-[10px] uppercase">Trained Timestamp</p>
              <p className="text-white font-mono text-xs mt-1">{new Date(info.trained_at).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-slate-400 font-mono text-[10px] uppercase">Algorithm</p>
              <p className="text-white font-mono text-xs mt-1">KMeans + StandardScaler</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-slate-400 font-mono text-[10px] uppercase">Selection Criterion</p>
              <p className="text-yellow-400 font-mono text-xs mt-1">Max Silhouette Score</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-slate-400 font-mono text-[10px] uppercase">Reproducibility Seed</p>
              <p className="text-white font-mono text-xs mt-1">random_state = 42</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
