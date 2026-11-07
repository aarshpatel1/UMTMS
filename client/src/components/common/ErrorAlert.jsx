export default function ErrorAlert({ message, onRetry, isFallback }) {
  return (
    <div
      className={`alert ${isFallback ? 'alert-warning' : 'alert-danger'} d-flex align-items-center justify-content-between mx-3 mt-3 mb-0`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${isFallback ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
        <div>
          {isFallback ? (
            <span>
              <strong>Offline / Demo Mode:</strong> Server is not reachable ({message}). Displaying preview records.
            </span>
          ) : (
            <span>
              <strong>Error:</strong> {message}
            </span>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm btn-outline-dark"
          onClick={onRetry}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Retry
        </button>
      )}
    </div>
  )
}
