import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Tag, FileText, CheckCircle } from 'lucide-react'
import type { DatasetInspectionResponse } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'
import QualityPanel from '../dashboard/QualityPanel'

interface DatasetInspectorProps {
  result: DatasetInspectionResponse
}

const FEATURE_GROUPS = [
  { key: 'watch_time_cols', label: 'Watch Time', color: 'badge-yellow' },
  { key: 'session_duration_cols', label: 'Session Duration', color: 'badge-green' },
  { key: 'session_count_cols', label: 'Session Count', color: 'badge-green' },
  { key: 'genre_cols', label: 'Genre / Content', color: 'badge-amber' },
  { key: 'completion_cols', label: 'Completion Rate', color: 'badge-yellow' },
  { key: 'recency_cols', label: 'Recency', color: 'badge-amber' },
  { key: 'activity_pattern_cols', label: 'Activity Pattern', color: 'badge-yellow' },
] as const

export default function DatasetInspector({ result }: DatasetInspectorProps) {
  const [showColumns, setShowColumns] = useState(false)
  const detected = result.detected_features

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Ingested File Header */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,212,0,0.15)]">
            <Search className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/25">
                INGESTED CSV
              </span>
              <p className="text-sm font-bold text-white font-mono truncate">{result.filename}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">{result.message}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality summary */}
        <GlassCard className="p-6">
          <p className="section-label mb-4">Dataset Telemetry Quality</p>
          <QualityPanel quality={result.quality} />
        </GlassCard>

        {/* Detected features */}
        <GlassCard className="p-6">
          <p className="section-label mb-4">Auto-Detected Behavioral Signals</p>

          {detected.user_id_col && (
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <Tag className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="text-xs text-slate-400">User Identifier Column:</span>
              <span className="font-mono text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                {detected.user_id_col}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {FEATURE_GROUPS.map(({ key, label, color }) => {
              const cols = detected[key]
              return (
                <div key={key} className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cols.length > 0 ? 'bg-yellow-400 shadow-[0_0_6px_#FFD400]' : 'bg-slate-700'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-300 font-medium">{label}</span>
                    {cols.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {cols.map(c => (
                          <span key={c} className={`${color} font-mono text-[10px]`}>{c}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono ml-2">— not present</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {(detected.unrecognized_numeric.length + detected.unrecognized_categorical.length) > 0 && (
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Non-Behavioral Columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {[...detected.unrecognized_numeric, ...detected.unrecognized_categorical].map(c => (
                  <span key={c} className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded font-mono">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Column Details Collapsible */}
      <GlassCard className="p-6">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setShowColumns(v => !v)}
        >
          <div>
            <p className="section-label">Detailed Column Specification</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditing {result.columns.length} columns for types, missing rates, and sample distributions
            </p>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
            {showColumns ? <ChevronUp className="w-4 h-4 text-yellow-400" /> : <ChevronDown className="w-4 h-4 text-yellow-400" />}
          </div>
        </button>

        {showColumns && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Data Type</th>
                  <th>Missing</th>
                  <th>Uniques</th>
                  <th>Sample Values</th>
                </tr>
              </thead>
              <tbody>
                {result.columns.map(col => (
                  <tr key={col.name} className="hover:bg-white/[0.02]">
                    <td className="font-mono text-xs font-bold text-yellow-400">{col.name}</td>
                    <td>
                      <span className="badge-yellow text-[10px] font-mono">{col.dtype}</span>
                    </td>
                    <td className={col.missing_pct > 20 ? 'text-amber-400 font-mono font-bold' : 'font-mono text-slate-400'}>
                      {col.missing_count} ({col.missing_pct}%)
                    </td>
                    <td className="font-mono text-slate-300">{col.unique_count.toLocaleString()}</td>
                    <td className="text-slate-400 text-xs max-w-xs truncate font-mono">
                      {col.sample_values.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  )
}
