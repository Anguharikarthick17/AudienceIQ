import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle, Search, Tag } from 'lucide-react'
import type { DatasetInspectionResponse } from '@/api/client'
import QualityPanel from '../dashboard/QualityPanel'

interface DatasetInspectorProps {
  result: DatasetInspectionResponse
}

const FEATURE_GROUPS = [
  { key: 'watch_time_cols', label: 'Watch Time', color: 'badge-brand' },
  { key: 'session_duration_cols', label: 'Session Duration', color: 'badge-green' },
  { key: 'session_count_cols', label: 'Session Count', color: 'badge-green' },
  { key: 'genre_cols', label: 'Genre / Content', color: 'badge-amber' },
  { key: 'completion_cols', label: 'Completion Rate', color: 'badge-brand' },
  { key: 'recency_cols', label: 'Recency', color: 'badge-amber' },
  { key: 'activity_pattern_cols', label: 'Activity Pattern', color: 'badge-brand' },
] as const

export default function DatasetInspector({ result }: DatasetInspectorProps) {
  const [showColumns, setShowColumns] = useState(false)
  const detected = result.detected_features

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* File header */}
      <div className="card flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{result.filename}</p>
          <p className="text-xs text-slate-500 mt-0.5">{result.message}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quality summary */}
        <div className="card">
          <p className="section-label mb-4">Dataset Quality</p>
          <QualityPanel quality={result.quality} />
        </div>

        {/* Detected features */}
        <div className="card">
          <p className="section-label mb-4">Auto-Detected Behavioral Features</p>

          {detected.user_id_col && (
            <div className="mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">User ID column:</span>
              <span className="font-mono text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                {detected.user_id_col}
              </span>
            </div>
          )}

          <div className="space-y-2.5">
            {FEATURE_GROUPS.map(({ key, label, color }) => {
              const cols = detected[key]
              return (
                <div key={key} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cols.length > 0 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <div className="flex-1">
                    <span className="text-xs text-slate-400">{label}</span>
                    {cols.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cols.map(c => (
                          <span key={c} className={`${color} font-mono text-[10px]`}>{c}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 ml-2">— not detected</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {(detected.unrecognized_numeric.length + detected.unrecognized_categorical.length) > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 mb-1">Unrecognized columns:</p>
              <div className="flex flex-wrap gap-1">
                {[...detected.unrecognized_numeric, ...detected.unrecognized_categorical].map(c => (
                  <span key={c} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column details (collapsible) */}
      <div className="card">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setShowColumns(v => !v)}
        >
          <p className="section-label">Column Details ({result.columns.length} columns)</p>
          {showColumns ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showColumns && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Missing</th>
                  <th>Unique</th>
                  <th>Sample Values</th>
                </tr>
              </thead>
              <tbody>
                {result.columns.map(col => (
                  <tr key={col.name}>
                    <td className="font-mono text-xs text-brand-400">{col.name}</td>
                    <td><span className="badge-brand text-[10px]">{col.dtype}</span></td>
                    <td className={col.missing_pct > 20 ? 'text-amber-400' : ''}>{col.missing_count} ({col.missing_pct}%)</td>
                    <td>{col.unique_count}</td>
                    <td className="text-slate-500 text-xs max-w-xs truncate">
                      {col.sample_values.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
