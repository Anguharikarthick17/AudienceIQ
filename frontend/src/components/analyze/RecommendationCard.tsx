import { CheckCircle, Sparkles } from 'lucide-react'

interface RecommendationCardProps {
  recommendation: string
  rationale?: string
  index: number
}

export default function RecommendationCard({ recommendation, rationale, index }: RecommendationCardProps) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.09]
                    hover:border-yellow-400/35 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_18px_rgba(255,212,0,0.08)]
                    transition-all duration-200">
      <div className="w-7 h-7 rounded-xl bg-yellow-400/10 border border-yellow-400/30
                      flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(255,212,0,0.15)]">
        <span className="text-xs font-mono font-bold text-yellow-400">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_6px_#34d399]" />
          <p className="text-sm text-slate-100 font-semibold leading-snug">{recommendation}</p>
        </div>
        {rationale && (
          <p className="text-xs text-slate-400 mt-2 ml-6 leading-relaxed font-normal">{rationale}</p>
        )}
      </div>
    </div>
  )
}
