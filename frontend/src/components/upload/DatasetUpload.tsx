import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2, Database
} from 'lucide-react'
import { api, type DatasetInspectionResponse } from '@/api/client'
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
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.')
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
      setError(e instanceof Error ? e.message : 'Upload failed')
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
      setError(e instanceof Error ? e.message : 'Training failed')
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onInputChange} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 className="w-10 h-10 text-brand-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">Uploading and inspecting dataset…</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">Drop your OTT dataset CSV here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              <p className="text-[10px] text-slate-600 mt-3">
                Supports any OTT-style CSV · Schema auto-detected · Max 500 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Train button */}
      {result?.quality.ready_to_train && !trainResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Ready to Train</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {result.quality.total_rows.toLocaleString()} users · {result.quality.usable_behavioral_features} behavioral features detected
            </p>
          </div>
          <button className="btn-primary shrink-0" onClick={handleTrain} disabled={training}>
            {training ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {training ? 'Training…' : 'Train Model'}
          </button>
        </motion.div>
      )}

      {/* Training result */}
      {trainResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Training Complete</p>
            <p className="text-xs text-slate-300 mt-1">{trainResult.message}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-slate-500">K = <span className="text-brand-400 font-bold">{trainResult.n_clusters}</span></span>
              <span className="text-xs text-slate-500">Silhouette = <span className="text-emerald-400 font-bold">{trainResult.silhouette_score.toFixed(4)}</span></span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Inspection results */}
      {result && <DatasetInspector result={result} />}
    </div>
  )
}
