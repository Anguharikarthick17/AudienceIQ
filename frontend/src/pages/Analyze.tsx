import TopBar from '@/components/layout/TopBar'
import UserAnalysis from '@/components/analyze/UserAnalysis'

export default function Analyze() {
  return (
    <>
      <TopBar title="Analyze User" />
      <div className="p-6">
        <div className="page-header">
          <h1 className="page-title">User Profile Analysis</h1>
          <p className="page-subtitle">
            Submit a viewer profile to get their audience segment, behavioral explanation,
            and transparent content recommendations.
          </p>
        </div>
        <UserAnalysis />
      </div>
    </>
  )
}
