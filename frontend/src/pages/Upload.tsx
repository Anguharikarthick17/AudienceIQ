import TopBar from '@/components/layout/TopBar'
import DatasetUpload from '@/components/upload/DatasetUpload'
import { Upload as UploadIcon } from 'lucide-react'

export default function Upload() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black relative selection:bg-yellow-400 selection:text-black">
      {/* Subtle top ambient radial yellow glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-yellow-ambient pointer-events-none" />

      <TopBar title="Dataset Ingestion" subtitle="Schema Detection & Model Training" />
      <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-5xl mx-auto w-full z-0">
        <div className="page-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold tracking-wider mb-3">
            <UploadIcon className="w-3.5 h-3.5" />
            <span>DATA INGESTION PIPELINE</span>
          </div>
          <h1 className="page-title">Dataset Upload & Ingestion</h1>
          <p className="page-subtitle">
            Upload any OTT-style CSV dataset. AudienceIQ will automatically detect behavioral features, sanitize data, audit null and duplicate rates, and fit the KMeans model.
          </p>
        </div>
        <DatasetUpload />
      </div>
    </div>
  )
}
