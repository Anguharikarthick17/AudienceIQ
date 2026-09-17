import TopBar from '@/components/layout/TopBar'
import ModelEvidence from '@/components/ml/ModelEvidence'

export default function ModelPage() {
  return (
    <>
      <TopBar title="ML Evidence" />
      <div className="p-6">
        <div className="page-header">
          <h1 className="page-title">Model Evidence</h1>
          <p className="page-subtitle">
            Objective ML metrics — K selection methodology, silhouette scores,
            inertia curves, cluster balance. All computed from actual data.
          </p>
        </div>
        <ModelEvidence />
      </div>
    </>
  )
}
