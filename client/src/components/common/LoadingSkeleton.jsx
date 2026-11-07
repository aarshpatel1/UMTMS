export default function LoadingSkeleton() {
  return (
    <div className="p-4 text-center my-4">
      <div className="spinner-border text-dark mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading data...</span>
      </div>
      <p className="text-muted fw-medium mb-0">Fetching records from server...</p>
    </div>
  )
}
