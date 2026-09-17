import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2, Database, Sparkles
} from 'lucide-react'
import { api, formatErrorMessage, type DatasetInspectionResponse } from '@/api/client'
import GlassCard from '@/components/common/GlassCard'
import GlassButton from '@/components/common/GlassButton'
import DatasetInspector from './DatasetInspector'

export default function DatasetUpload() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [training, setTraining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DatasetInspectionResponse | null>(null)
  const [trainResult, setTrainResult] = useState<{ n_clusters: number; silhouette_score: number; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.')
      return
    }
    setError(null)
    setUploading(true)
    setResult(null)
    setTrainResult(null)
    try {
      const res = await api.uploadDataset(file)
      setResult(res)
    } catch (e: unknown) {
      setError(formatErrorMessage(e, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleTrain = async () => {
    setTraining(true)
    setError(null)
    try {
      const res = await api.trainModel()
      setTrainResult({ n_clusters: res.n_clusters, silhouette_score: res.silhouette_score, message: res.message })
    } catch (e: unknown) {
      setError(formatErrorMessage(e, 'Training failed'))
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={`dropzone relative overflow-hidden transition-all duration-300 ${dragging ? 'dropzone-active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onInputChange} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-spin drop-shadow-[0_0_12px_#FFD400]" />
              <p className="text-base text-white font-bold font-mono">Parsing & Sanitizing Dataset Telemetry…</p>
              <p className="text-xs text-slate-400 mt-1">Inspecting column types, null values, and behavioral signals</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Upload className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,212,0,0.4)]" />
              </div>
              <p className="text-lg font-bold text-white tracking-tight">Drop OTT Dataset CSV Here</p>
              <p className="text-xs text-slate-400">or click to browse files</p>
              <div className="flex items-center justify-center gap-3 pt-3 text-[11px] font-mono text-slate-500">
                <span>Supports any OTT-style schema</span>
                <span>•</span>
                <span>Auto-detects features</span>
                <span>•</span>
                <span>Max 500 MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Ready to Train Card */}
      {result?.quality.ready_to_train && !trainResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <p className="text-base font-bold text-white">Dataset Sanitized & Ready For Training</p>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {result.quality.total_rows.toLocaleString()} records • {result.quality.usable_behavioral_features} usable behavioral signals identified
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleTrain}
              disabled={training}
              className="w-full sm:w-auto shrink-0"
            >
              {training ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{training ? 'Training Model Pipeline…' : 'Train KMeans Model →'}</span>
            </GlassButton>
          </GlassCard>
        </motion.div>
      )}

      {/* Training Completion Result */}
      {trainResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 border-emerald-500/30 bg-emerald-500/[0.04]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-emerald-400">Training Successfully Completed</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{trainResult.message}</p>
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/[0.06] text-xs font-mono">
                  <span className="text-slate-400">
                    Selected Clusters: <strong className="text-yellow-400">K = {trainResult.n_clusters}</strong>
                  </span>
                  <span className="text-slate-400">
                    Silhouette Score: <strong className="text-emerald-400">{trainResult.silhouette_score.toFixed(4)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Persistence: <strong className="text-white">Artifacts Written to /models</strong>
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Inspection Details */}
      {result && <DatasetInspector result={result} />}
    </div>
  )
}
