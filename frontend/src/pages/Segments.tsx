import { useEffect, useState } from 'react'
import { Users, AlertCircle } from 'lucide-react'
import { api, type SegmentDetail } from '@/api/client'
import TopBar from '@/components/layout/TopBar'
import SegmentExplorer from '@/components/segments/SegmentExplorer'

export default function Segments() {
  const [segments, setSegments] = useState<SegmentDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSegments()
      .then(setSegments)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <TopBar title="Segment Explorer" />
      <div className="p-6">
        <div className="page-header">
          <h1 className="page-title">Audience Segments</h1>
          <p className="page-subtitle">
            Click a segment to explore its full behavioral profile, genre affinities,
            and personalization strategy.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 skeleton rounded-xl" />
              ))}
            </div>
            <div className="xl:col-span-3 h-64 skeleton rounded-xl" />
          </div>
        )}

        {error && (
          <div className="card text-center py-16">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Model not trained yet</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <p className="text-xs text-slate-600 mt-3">Upload a dataset and train the model first.</p>
          </div>
        )}

        {!loading && !error && segments.length === 0 && (
          <div className="card text-center py-16">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No segments discovered yet</p>
          </div>
        )}

        {!loading && segments.length > 0 && (
          <SegmentExplorer segments={segments} />
        )}
      </div>
    </>
  )
}
