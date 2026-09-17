import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Tv, Clock, Target, BarChart3, Database } from 'lucide-react'
import { api, isApiUnavailable, formatErrorMessage, type DashboardResponse } from '@/api/client'
import MetricCard from '@/components/dashboard/MetricCard'
import SegmentChart from '@/components/dashboard/SegmentChart'
import GenreChart from '@/components/dashboard/GenreChart'
import QualityPanel from '@/components/dashboard/QualityPanel'
import TopBar from '@/components/layout/TopBar'
import ApiUnavailableState from '@/components/common/ApiUnavailableState'

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(formatErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-xl" />
        ))}
      </div>
    </>
  )

  if (error || !data) {
    const isUnavailable = isApiUnavailable(error)
    return (
      <>
        <TopBar title="Dashboard" />
        <div className="p-6">
          {isUnavailable ? (
            <ApiUnavailableState />
          ) : (
            <div className="card text-center py-16">
              <Database className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No data available yet</p>
              {error && <p className="text-xs text-slate-500 mt-1">{error}</p>}
              <p className="text-xs text-slate-600 mt-3">Upload a dataset and train the model to see analytics.</p>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Viewers" value={data.total_viewers.toLocaleString()}
            icon={Users} iconColor="text-brand-400" delay={0} />
          <MetricCard label="Segments" value={data.n_segments}
            subtitle="Discovered audience groups"
            icon={BarChart3} iconColor="text-violet-400" delay={0.05} />
          <MetricCard label="Avg Watch Time" value={`${data.avg_watch_time.toFixed(1)}h`}
            subtitle="Per viewer" icon={Tv} iconColor="text-cyan-400" delay={0.1} />
          <MetricCard label="Avg Session" value={`${data.avg_session_mins.toFixed(0)}m`}
            subtitle="Per session" icon={Clock} iconColor="text-emerald-400" delay={0.15} />
        </div>

        {/* Quality metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Silhouette Score" value={data.silhouette_score.toFixed(4)}
            subtitle="K selection quality (higher = better)"
            icon={Target} iconColor="text-amber-400" delay={0.2} />
          <MetricCard
            label="Inertia"
            value={data.inertia.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            subtitle="Within-cluster variance"
            icon={BarChart3} iconColor="text-rose-400" delay={0.25} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">Segment Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Audience share across discovered segments</p>
            {data.segments.length > 0
              ? <SegmentChart segments={data.segments} />
              : <p className="text-sm text-slate-600 py-10 text-center">No segments available</p>}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">Genre Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Viewers by content genre preference</p>
            {Object.keys(data.genre_distribution).length > 0
              ? <GenreChart data={data.genre_distribution} />
              : <p className="text-sm text-slate-600 py-10 text-center">No genre data available</p>}
          </div>
        </div>

        {/* Dataset quality */}
        {data.dataset_quality && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="card">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">Dataset Health</h2>
            <QualityPanel quality={data.dataset_quality} />
          </motion.div>
        )}
      </div>
    </>
  )
}
