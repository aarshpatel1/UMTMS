import { useState, useEffect } from 'react'

export default function FilterModal({
  isOpen,
  onClose,
  columns = [],
  currentFilter,
  onApplyFilter,
  onResetFilter,
}) {
  const [selectedColumn, setSelectedColumn] = useState('')
  const [operator, setOperator] = useState('contains')
  const [filterValue, setFilterValue] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (currentFilter && currentFilter.column) {
        setSelectedColumn(currentFilter.column)
        setOperator(currentFilter.operator || 'contains')
        setFilterValue(currentFilter.value || '')
      } else {
        setSelectedColumn(columns.length > 0 ? columns[0].key : '')
        setOperator('contains')
        setFilterValue('')
      }
    }
  }, [isOpen, currentFilter, columns])

  if (!isOpen) return null

  const handleApply = (e) => {
    e.preventDefault()
    if (!filterValue.trim()) {
      onResetFilter()
      onClose()
      return
    }
    onApplyFilter({
      column: selectedColumn,
      operator,
      value: filterValue.trim(),
    })
    onClose()
  }

  const handleReset = () => {
    setFilterValue('')
    onResetFilter()
    onClose()
  }

  return (
    <div
      className="custom-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="custom-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="custom-modal-header">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-funnel text-primary"></i>
            <h5 className="custom-modal-title">Filter Records</h5>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleApply}>
          <div className="custom-modal-body">
            <p className="text-muted small mb-3">
              Apply dynamic filter conditions to refine the visible records.
            </p>

            {/* Column selection */}
            <div className="mb-3">
              <label htmlFor="filterColumnSelect" className="form-label small fw-semibold text-secondary">
                Select Column
              </label>
              <select
                id="filterColumnSelect"
                className="form-select form-select-sm"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator selection */}
            <div className="mb-3">
              <label htmlFor="filterOperatorSelect" className="form-label small fw-semibold text-secondary">
                Match Condition
              </label>
              <select
                id="filterOperatorSelect"
                className="form-select form-select-sm"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                <option value="contains">Contains (case-insensitive)</option>
                <option value="equals">Exact Match</option>
                <option value="starts_with">Starts with</option>
                <option value="ends_with">Ends with</option>
              </select>
            </div>

            {/* Filter value */}
            <div className="mb-2">
              <label htmlFor="filterValueInput" className="form-label small fw-semibold text-secondary">
                Filter Value
              </label>
              <input
                id="filterValueInput"
                type="text"
                className="form-control form-control-sm"
                placeholder="Enter value to filter by..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="custom-modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleReset}
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="btn btn-dark btn-sm px-3"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
