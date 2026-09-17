import TopBar from '@/components/layout/TopBar'
import UserAnalysis from '@/components/analyze/UserAnalysis'

export default function Analyze() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle top ambient radial yellow glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="User Intelligence" subtitle="Per-Profile Real-Time Inference" />
      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <span>INFERENCE ANALYZER</span>
          </div>
          <h1 className="page-title">User Profile Analysis</h1>
          <p className="page-subtitle">
            Submit viewer telemetry to discover their audience segment, inspect centroid proximity, review explainable rationale, and evaluate personalized content recommendations.
          </p>
        </div>
        <UserAnalysis />
      </div>
    </div>
  )
}
