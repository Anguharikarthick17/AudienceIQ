import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { DatasetQuality } from '@/api/client'

interface QualityPanelProps {
  quality: DatasetQuality
}

export default function QualityPanel({ quality }: QualityPanelProps) {
  const metrics = [
    { label: 'Total Rows', value: quality.total_rows.toLocaleString() },
    { label: 'Columns', value: quality.total_cols },
    { label: 'Duplicate Rows', value: `${quality.duplicate_rows} (${quality.duplicate_pct}%)` },
    { label: 'Missing Cells', value: `${quality.missing_cells.toLocaleString()} (${quality.missing_cell_pct}%)` },
    { label: 'Numeric Cols', value: quality.numeric_cols },
    { label: 'Categorical Cols', value: quality.categorical_cols },
    { label: 'Behavioral Features', value: quality.usable_behavioral_features },
  ]

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
        quality.ready_to_train
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
      }`}>
        {quality.ready_to_train
          ? <CheckCircle className="w-4 h-4 shrink-0" />
          : <AlertTriangle className="w-4 h-4 shrink-0" />
        }
        <span className="font-medium">
          {quality.ready_to_train ? 'Ready to train' : 'Review warnings before training'}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(m => (
          <div key={m.label} className="bg-slate-800/40 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className="text-sm font-semibold text-slate-200">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {quality.warnings.length > 0 && (
        <div className="space-y-2">
          <p className="section-label">Warnings</p>
          {quality.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
