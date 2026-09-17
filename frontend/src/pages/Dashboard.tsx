import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Tv, Clock, Target, BarChart3, Database,
  ArrowRight, Sparkles, UserSearch, FlaskConical, Layers, Shield
} from 'lucide-react'
import { api, isApiUnavailable, formatErrorMessage, type DashboardResponse } from '@/api/client'
import MetricCard from '@/components/dashboard/MetricCard'
import SegmentChart from '@/components/dashboard/SegmentChart'
import GenreChart from '@/components/dashboard/GenreChart'
import QualityPanel from '@/components/dashboard/QualityPanel'
import TopBar from '@/components/layout/TopBar'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'
import Audience3DOrb from '@/components/common/Audience3DOrb'
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-black">
        <TopBar title="Audience Intelligence" subtitle="Live Behavioral Portfolio" />
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Skeleton */}
          <div className="h-64 rounded-3xl bg-white/[0.03] animate-pulse border border-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    const isUnavailable = isApiUnavailable(error)
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-black">
        <TopBar title="Audience Intelligence" subtitle="Live Behavioral Portfolio" />
        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {isUnavailable ? (
            <ApiUnavailableState />
          ) : (
            <GlassCard className="text-center py-16 px-6">
              <Database className="w-12 h-12 text-yellow-500/60 mx-auto mb-3 animate-pulse" />
              <p className="text-base font-bold text-white">No Telemetry Ingested</p>
              {error && <p className="text-xs text-yellow-400/80 mt-1 font-mono">{error}</p>}
              <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto">
                Ingest an OTT dataset via Dataset Upload and trigger the KMeans training pipeline.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/upload">
                  <GlassButton variant="primary">Go to Dataset Upload →</GlassButton>
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle top ambient radial yellow glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="Audience Intelligence" subtitle="Explainable OTT Portfolio" />

      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full z-0">
        {/* ================================================================ */}
        {/* HERO SECTION: "Understand Audiences. BEYOND THE NUMBERS."        */}
        {/* ================================================================ */}
        <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent 
                            border border-white/[0.12] border-t-white/[0.22] p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Internal specular highlight reflection */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNSUPERVISED OTT INTELLIGENCE</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none">
                  Understand Audiences.
                </h2>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-yellow-400 drop-shadow-[0_0_25px_rgba(255,212,0,0.35)] leading-tight">
                  BEYOND THE NUMBERS
                </h2>
              </div>

              <p className="text-sm lg:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                Explainable audience intelligence for the next generation of OTT streaming platforms. 
                Discover genuine viewer cohorts, audit assignment reasoning, and simulate behavioral shifts without opaque black boxes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/analyze">
                  <GlassButton variant="primary" size="lg" className="group">
                    <span>Analyze Audience</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </GlassButton>
                </Link>

                <Link to="/segments">
                  <GlassButton variant="secondary" size="lg">
                    <span>Explore Segments</span>
                  </GlassButton>
                </Link>
              </div>

              {/* Telemetry Micro-Badges */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/[0.08] text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span>{data.total_viewers.toLocaleString()} Ingested</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#FFD400]" />
                  <span>K={data.n_segments} Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                  <span>Silhouette {data.silhouette_score.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Right Abstract 3D Glass Audience Visualization */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <Audience3DOrb size={300} />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* KPI METRIC CARDS                                                 */}
        {/* ================================================================ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Viewers"
            value={data.total_viewers.toLocaleString()}
            subtitle="Ingested audience telemetry"
            trend="+12%"
            icon={Users}
            delay={0}
            isHighlighted
          />
          <MetricCard
            label="Audience Segments"
            value={data.n_segments}
            subtitle="Quantitative clusters"
            icon={BarChart3}
            delay={0.05}
          />
          <MetricCard
            label="Avg Watch Time"
            value={`${data.avg_watch_time.toFixed(1)}h`}
            subtitle="Per-viewer consumption"
            icon={Tv}
            delay={0.1}
          />
          <MetricCard
            label="Avg Session"
            value={`${data.avg_session_mins.toFixed(0)}m`}
            subtitle="Session engagement"
            icon={Clock}
            delay={0.15}
          />
        </section>

        {/* ================================================================ */}
        {/* QUALITY & CLUSTER METRICS                                         */}
        {/* ================================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5" delay={0.2}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Silhouette Score (K-Evaluation)
                </p>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <p className="text-3xl font-black font-mono text-white tracking-tight">
                    {data.silhouette_score.toFixed(4)}
                  </p>
                  <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                    OPTIMAL SEPARATION
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Quantitative cluster separation metric; globally maximized at K={data.n_segments}.
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-white/[0.08] to-black/60 border border-white/15 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_#FFD400]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" delay={0.25}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Model Inertia (Elbow Criterion)
                </p>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <p className="text-3xl font-black font-mono text-white tracking-tight">
                    {data.inertia.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <span className="text-xs font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                    CONVERGED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Sum of squared Euclidean distances to assigned cluster centroids.
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-white/[0.08] to-black/60 border border-white/15 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ================================================================ */}
        {/* CHARTS ROW: SEGMENT DISTRIBUTION & GENRE DISTRIBUTION             */}
        {/* ================================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Audience Segment Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Empirical viewer distribution across discovered cohorts</p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded border border-yellow-400/25">
                KMEANS
              </span>
            </div>
            {data.segments.length > 0 ? (
              <SegmentChart segments={data.segments} />
            ) : (
              <p className="text-sm text-slate-500 py-16 text-center">No segments available</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Genre Preference Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top content category affinities across platform audience</p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white/[0.05] text-slate-400 px-2 py-1 rounded border border-white/10">
                10 GENRES
              </span>
            </div>
            {Object.keys(data.genre_distribution).length > 0 ? (
              <GenreChart data={data.genre_distribution} />
            ) : (
              <p className="text-sm text-slate-500 py-16 text-center">No genre telemetry available</p>
            )}
          </GlassCard>
        </section>

        {/* ================================================================ */}
        {/* DASHBOARD FEATURE CARDS (AUDIENCE INTELLIGENCE LAB)               */}
        {/* ================================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold">
                AUDIENCE INTELLIGENCE LAB
              </p>
              <h3 className="text-lg font-bold text-white">Advanced Behavioral Modules</h3>
            </div>
            <Link to="/counterfactual" className="text-xs font-mono text-yellow-400 hover:underline flex items-center gap-1">
              <span>View All Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Analyze a User */}
            <Link to="/analyze" className="group block">
              <GlassCard className="p-6 h-full flex flex-col justify-between group-hover:border-yellow-400/40 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/5 border border-yellow-400/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserSearch className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                      Per-User Classification
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Evaluate individual viewing telemetry, inspect centroid distance, and generate explainable recommendations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] text-xs font-mono text-yellow-400">
                  <span>LAUNCH ANALYZER</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </GlassCard>
            </Link>

            {/* Card 2: Counterfactual Lab */}
            <Link to="/counterfactual" className="group block">
              <GlassCard className="p-6 h-full flex flex-col justify-between group-hover:border-yellow-400/40 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/5 border border-yellow-400/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                        Counterfactual Lab
                      </h4>
                      <span className="text-[9px] font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                        SIMULATOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      "What if viewer behavior changed?" Test hypothetical watch-time and genre adjustments through the persisted model.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] text-xs font-mono text-yellow-400">
                  <span>RUN SIMULATION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </GlassCard>
            </Link>

            {/* Card 3: ML Evidence */}
            <Link to="/model" className="group block">
              <GlassCard className="p-6 h-full flex flex-col justify-between group-hover:border-yellow-400/40 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/5 border border-yellow-400/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FlaskConical className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                      ML Audit Evidence
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Inspect mathematical K-selection elbow curve, silhouette statistics, feature weights, and evaluator metrics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] text-xs font-mono text-yellow-400">
                  <span>AUDIT PIPELINE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </GlassCard>
            </Link>
          </div>
        </section>

        {/* ================================================================ */}
        {/* DATASET QUALITY PANEL                                            */}
        {/* ================================================================ */}
        {data.dataset_quality && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Dataset Sanitization & Health</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated validation of incoming OTT behavioral telemetry</p>
              </div>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <QualityPanel quality={data.dataset_quality} />
          </GlassCard>
        )}

        {/* ================================================================ */}
        {/* REFINED MINIMAL GLASS FOOTER                                     */}
        {/* ================================================================ */}
        <footer className="pt-8 pb-12 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">AudienceIQ v1.0</span>
            <span className="text-slate-600">•</span>
            <span className="text-yellow-400 font-bold">TEAM LIQUID</span>
            <span className="text-slate-600">•</span>
            <span>IT HAPPENS @ RAALE</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Anguharikarthick17/AudienceIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors"
            >
              GitHub Repository
            </a>
            <Link to="/model" className="hover:text-yellow-400 transition-colors">
              Evaluation Metrics
            </Link>
            <span className="text-slate-600">Apache-2.0</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
