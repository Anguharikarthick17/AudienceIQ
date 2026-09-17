import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { DatasetQuality } from '@/api/client'

interface QualityPanelProps {
  quality: DatasetQuality
}

export default function QualityPanel({ quality }: QualityPanelProps) {
  const metrics = [
    { label: 'Total Rows', value: quality.total_rows.toLocaleString() },
    { label: 'Total Columns', value: quality.total_cols },
    { label: 'Duplicates', value: `${quality.duplicate_rows} (${quality.duplicate_pct.toFixed(1)}%)` },
    { label: 'Missing Cells', value: `${quality.missing_cells.toLocaleString()} (${quality.missing_cell_pct.toFixed(1)}%)` },
    { label: 'Numeric Features', value: quality.numeric_cols },
    { label: 'Categorical Fields', value: quality.categorical_cols },
    { label: 'Usable Signals', value: quality.usable_behavioral_features },
  ]

  return (
    <div className="space-y-4">
      {/* Ready Status Capsule */}
      <div className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-md ${
        quality.ready_to_train
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}>
        <div className="flex items-center gap-2.5">
          {quality.ready_to_train ? (
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 drop-shadow-[0_0_6px_#34d399]" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-400 drop-shadow-[0_0_6px_#FFD400]" />
          )}
          <span className="text-xs font-bold font-mono tracking-wide">
            {quality.ready_to_train ? 'DATASET SANITIZED & READY FOR ML' : 'DATASET REQUIRES REVIEW'}
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-80">VERIFIED</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {metrics.map(m => (
          <div
            key={m.label}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 hover:border-yellow-400/25 transition-colors"
          >
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{m.label}</p>
            <p className="text-sm font-bold font-mono text-slate-100 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Warnings List if any */}
      {quality.warnings && quality.warnings.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-yellow-500 font-bold">Advisory Warnings</p>
          {quality.warnings.map((w, i) => (
            <div
              key={i}
              className="text-xs text-yellow-300/80 bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-2 flex items-center gap-2 font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
