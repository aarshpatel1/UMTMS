export default function DeleteConfirmModal({
  isOpen,
  mode = 'single', // 'single' | 'multiple'
  entityTitle = 'Record',
  record = null,
  count = 1,
  selectedIds = [],
  primaryKey = 'id',
  onClose,
  onConfirm,
  isDeleting = false,
  error = null,
}) {
  if (!isOpen) return null

  const isMultiple = mode === 'multiple'
  const recordId = record ? record[primaryKey] : null

  return (
    <div
      className="custom-modal-backdrop"
      onClick={isDeleting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="custom-modal-dialog"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="custom-modal-header border-0 pb-0 pt-4 px-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#fee4e2',
                color: '#d92d20',
                fontSize: '1.25rem',
              }}
            >
              <i className="bi bi-trash3-fill"></i>
            </div>
            <div>
              <h5 className="custom-modal-title text-danger mb-0">
                {isMultiple ? `Delete ${count} Records?` : `Delete ${entityTitle}?`}
              </h5>
              <small className="text-muted">
                {isMultiple
                  ? `Batch deletion confirmation for ${count} items`
                  : `Record ID: #${recordId}`}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="custom-modal-body px-4 py-3">
          {error && (
            <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <div>{error}</div>
            </div>
          )}

          <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
            {isMultiple ? (
              <>
                Are you sure you want to permanently delete the <strong>{count}</strong> selected{' '}
                <strong>{entityTitle.toLowerCase()}</strong> records?
              </>
            ) : (
              <>
                Are you sure you want to permanently delete this{' '}
                <strong>{entityTitle.toLowerCase()}</strong> (ID: <strong>#{recordId}</strong>)?
              </>
            )}
          </p>

          {/* Details / Preview Card */}
          {isMultiple ? (
            <div className="p-3 bg-light rounded border mb-3">
              <span className="small text-muted fw-semibold d-block mb-2">
                Selected Record IDs:
              </span>
              <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {selectedIds.map((id) => (
                  <span
                    key={id}
                    className="badge bg-white text-secondary border font-monospace px-2 py-1"
                  >
                    #{id}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            record && (
              <div className="p-3 bg-light rounded border mb-3 small">
                <div className="row g-2">
                  {Object.entries(record)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} className="col-6">
                        <span className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                          {k.replace(/_/g, ' ').toUpperCase()}:
                        </span>
                        <span className="fw-semibold text-dark text-truncate d-block">
                          {String(v ?? '—')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )
          )}

          <div
            className="alert alert-warning py-2 px-3 mb-0 small d-flex align-items-center gap-2"
            style={{ backgroundColor: '#fffaeb', borderColor: '#fedf89', color: '#b54708' }}
          >
            <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
            <div>
              <strong>Warning:</strong> This operation cannot be undone. Data will be permanently removed.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="custom-modal-footer px-4 py-3 bg-light">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger px-4 d-inline-flex align-items-center gap-2"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            <span>
              {isDeleting
                ? 'Deleting...'
                : isMultiple
                ? `Delete (${count}) Records`
                : 'Delete Record'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
