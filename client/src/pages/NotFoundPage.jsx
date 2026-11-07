import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <span
          className="badge rounded-pill px-3 py-2 text-purple fw-semibold"
          style={{ backgroundColor: '#f9f5ff', color: '#6941c6', fontSize: '0.9rem' }}
        >
          404 error
        </span>
      </div>

      <h1 className="display-5 fw-bold text-dark mb-3">Page not found</h1>
      <p className="text-muted lead fs-6 mx-auto mb-4" style={{ maxWidth: '480px' }}>
        Sorry, the page you are looking for doesn't exist or has been moved. Check the URL or navigate back to the dashboard.
      </p>

      <div className="d-flex justify-content-center gap-3">
        <Link to="/dashboard" className="btn btn-dark px-4 py-2 fw-medium">
          <i className="bi bi-house-door me-2"></i>
          Back to Dashboard
        </Link>
        <Link to="/vehicles" className="btn btn-outline-secondary px-4 py-2 fw-medium">
          <i className="bi bi-car-front me-2"></i>
          View Vehicles
        </Link>
      </div>
    </div>
  )
}
