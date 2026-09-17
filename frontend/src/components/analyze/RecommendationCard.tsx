import { CheckCircle, Sparkles } from 'lucide-react'

interface RecommendationCardProps {
  recommendation: string
  rationale?: string
  index: number
}

export default function RecommendationCard({ recommendation, rationale, index }: RecommendationCardProps) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40
                    hover:border-slate-600/60 transition-colors duration-150">
      <div className="w-6 h-6 rounded-full bg-brand-600/20 border border-brand-500/30
                      flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px] font-bold text-brand-400">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-200 font-medium">{recommendation}</p>
        </div>
        {rationale && (
          <p className="text-xs text-slate-500 mt-1.5 ml-5 leading-relaxed">{rationale}</p>
        )}
      </div>
    </div>
  )
}
