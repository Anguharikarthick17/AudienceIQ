import { useEffect, useState } from 'react'
import { Users, AlertCircle, Sparkles } from 'lucide-react'
import { api, isApiUnavailable, formatErrorMessage, type SegmentDetail } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import SegmentExplorer from '@/components/segments/SegmentExplorer'
import GlassCard from '@/components/common/GlassCard'
import ApiUnavailableState from '@/components/common/ApiUnavailableState'

export default function Segments() {
  const [segments, setSegments] = useState<SegmentDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSegments()
      .then(setSegments)
      .catch(e => setError(formatErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle top ambient radial yellow glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="Segment Portfolio" subtitle="Unsupervised K-Means Behavioral Cohorts" />
      
      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISCOVERED COHORTS</span>
          </div>
          <h1 className="page-title">Audience Segments</h1>
          <p className="page-subtitle">
            Explore quantitative behavioral cohorts, inspect genre affinities, review feature distributions, and inspect personalized strategies.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 skeleton rounded-2xl" />
              ))}
            </div>
            <div className="xl:col-span-3 h-80 skeleton rounded-2xl" />
          </div>
        )}

        {error && (
          isApiUnavailable(error) ? (
            <ApiUnavailableState />
          ) : (
            <GlassCard className="text-center py-16 px-6">
              <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3 animate-pulse" />
              <p className="text-base font-bold text-white">Model Not Trained Yet</p>
              <p className="text-xs text-yellow-400/80 mt-1 font-mono">{formatErrorMessage(error)}</p>
              <p className="text-xs text-slate-400 mt-3 max-w-sm mx-auto">
                Ingest an OTT dataset in the Dataset Upload section to fit the KMeans clustering pipeline.
              </p>
            </GlassCard>
          )
        )}

        {!loading && !error && segments.length === 0 && (
          <GlassCard className="text-center py-16">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No segments discovered yet</p>
          </GlassCard>
        )}

        {!loading && segments.length > 0 && (
          <SegmentExplorer segments={segments} />
        )}
      </div>
    </div>
  )
}
