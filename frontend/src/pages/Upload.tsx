import TopBar from '@/components/layout/TopBar'
import DatasetUpload from '@/components/upload/DatasetUpload'

export default function Upload() {
  return (
    <>
      <TopBar title="Dataset Upload" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Dataset Upload</h1>
          <p className="page-subtitle">
            Upload any OTT-style CSV dataset. AudienceIQ will auto-detect behavioral
            features and inspect data quality — no fixed schema required.
          </p>
        </div>
        <DatasetUpload />
      </div>
    </>
  )
}
