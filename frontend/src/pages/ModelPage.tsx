import TopBar from '@/components/layout/TopBar'
import ModelEvidence from '@/components/ml/ModelEvidence'
import { FlaskConical } from 'lucide-react'

export default function ModelPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle top ambient radial yellow glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="ML Evidence" subtitle="Mathematical Transparency & Verification" />
      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>MODEL TELEMETRY</span>
          </div>
          <h1 className="page-title">Objective Machine Learning Evidence</h1>
          <p className="page-subtitle">
            Zero black-box assertions. Inspect quantitative K-selection methodology, empirical silhouette curves, within-cluster inertia (WCSS), and cluster balance metrics computed from real dataset telemetry.
          </p>
        </div>
        <ModelEvidence />
      </div>
    </div>
  )
}
