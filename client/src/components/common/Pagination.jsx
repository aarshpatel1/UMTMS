export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1 && totalRecords <= pageSize) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing <strong>{totalRecords}</strong> {totalRecords === 1 ? 'record' : 'records'}
        </div>
      </div>
    )
  }

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalRecords)

  // Generate page numbers with ellipsis if needed
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="pagination-container">
      {/* Information text */}
      <div className="pagination-info">
        Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
        <strong>{totalRecords}</strong> records
      </div>

      {/* Page Numbers */}
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <i className="bi bi-chevron-left"></i>
          <span className="d-none d-sm-inline">Previous</span>
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted">
                ...
              </span>
            )
          }

          return (
            <button
              key={p}
              type="button"
              className={`pagination-pill ${currentPage === p ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        })}

        <button
          type="button"
          className="pagination-btn-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span className="d-none d-sm-inline">Next</span>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}
