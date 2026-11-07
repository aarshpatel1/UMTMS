import { useState } from 'react'
import { FOREIGN_KEY_MAP } from '../../config/routesConfig'
import { formatCellDisplay } from '../../utils/formatters'

export default function DataTable({
  columns = [],
  data = [],
  primaryKey = 'id',
  currentEntityKey = '',
  sortColumn,
  sortDirection,
  onSort,
  onOpenRelated,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Toggle selection for a single row
  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle select all on current page
  const allCurrentSelected =
    data.length > 0 && data.every((row) => selectedIds.has(row[primaryKey]))

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allCurrentSelected) {
        data.forEach((row) => next.delete(row[primaryKey]))
      } else {
        data.forEach((row) => next.add(row[primaryKey]))
      }
      return next
    })
  }

  // Helper to render badge colors based on text/status
  const renderBadgePill = (val) => {
    const text = String(val)
    const lower = text.toLowerCase()

    let badgeClass = 'badge-gray'
    if (
      lower.includes('admin') ||
      lower.includes('active') ||
      lower.includes('paid') ||
      lower.includes('online') ||
      lower.includes('operational') ||
      lower.includes('available')
    ) {
      badgeClass = 'badge-green'
    } else if (
      lower.includes('export') ||
      lower.includes('sedan') ||
      lower.includes('suv') ||
      lower.includes('expressway') ||
      lower.includes('dispatched') ||
      lower.includes('bus rapid')
    ) {
      badgeClass = 'badge-blue'
    } else if (
      lower.includes('import') ||
      lower.includes('electric') ||
      lower.includes('resolved') ||
      lower.includes('metro') ||
      lower.includes('arrived')
    ) {
      badgeClass = 'badge-purple'
    } else if (
      lower.includes('pending') ||
      lower.includes('maintenance') ||
      lower.includes('congested') ||
      lower.includes('speed')
    ) {
      badgeClass = 'badge-amber'
    } else if (
      lower.includes('red') ||
      lower.includes('violation') ||
      lower.includes('offline') ||
      lower.includes('emergency')
    ) {
      badgeClass = 'badge-red'
    }

    return <span className={`badge-custom ${badgeClass}`}>{text}</span>
  }

  // Format cell value
  const renderCellContent = (row, col) => {
    const val = row[col.key]

    if (val === null || val === undefined || val === '') {
      return <span className="text-muted">—</span>
    }

    // Check if this column is a foreign key / ID other than the primary key
    const isOtherId =
      col.key !== primaryKey &&
      (Boolean(FOREIGN_KEY_MAP[col.key]) || col.key.endsWith('_id'))

    if (isOtherId) {
      const fk = FOREIGN_KEY_MAP[col.key]
      const targetEntity = fk?.entityKey || col.key.replace('_id', 's')
      const targetLabel = fk?.label || col.label

      return (
        <div className="d-inline-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border px-2 py-1 fw-medium font-monospace">
            #{String(val)}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary btn-eye-id"
            title={`View related ${targetLabel} (#${val})`}
            onClick={(e) => {
              e.stopPropagation()
              if (onOpenRelated) {
                onOpenRelated(targetEntity, val, targetLabel)
              }
            }}
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
      )
    }

    if (col.isBadge) {
      return renderBadgePill(val)
    }

    if (col.isPrimary) {
      return (
        <div className="cell-primary">
         
          <div>
            <div className="cell-title">{formatCellDisplay(col.key, val)}</div>
          </div>
        </div>
      )
    }

    // Default formatted string (including dates and timestamps)
    return formatCellDisplay(col.key, val)
  }

  return (
    <div className="table-responsive-custom">
      <table className="custom-table">
        <thead>
          <tr>
            {/* Checkbox Column */}
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={allCurrentSelected}
                onChange={toggleSelectAll}
                aria-label="Select all rows"
              />
            </th>

            {/* Configured Columns */}
            {columns.map((col) => {
              const isSorted = sortColumn === col.key
              return (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className="d-inline-flex align-items-center">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className={`th-sort-icon ${isSorted ? 'active' : ''}`}>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <i className="bi bi-arrow-up"></i>
                          ) : (
                            <i className="bi bi-arrow-down"></i>
                          )
                        ) : (
                          <i className="bi bi-arrow-down-up opacity-25"></i>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}

            {/* Actions Column */}
            <th style={{ width: '80px', textAlign: 'center' }}>
              <span>Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-search"></i>
                  </div>
                  <h4 className="empty-title">No matching records found</h4>
                  <p className="empty-subtitle">
                    Try adjusting your search query or removing active filters to view results.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const id = row[primaryKey] ?? index
              const isSelected = selectedIds.has(id)

              return (
                <tr key={id} className={isSelected ? 'table-active' : ''}>
                  {/* Row Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(id)}
                      aria-label={`Select row ${id}`}
                    />
                  </td>

                  {/* Row Cells */}
                  {columns.map((col) => (
                    <td key={col.key}>{renderCellContent(row, col)}</td>
                  ))}

                  {/* Actions Dropdown & Eye Button */}
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {/* Eye Button to View This Row Record Modal */}
                    <button
                      type="button"
                      className="btn-action-dots text-primary me-1"
                      title="View full record details"
                      onClick={() => {
                        if (onOpenRelated) {
                          onOpenRelated(currentEntityKey, id, `Record #${id}`)
                        }
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Three dots action */}
                    <button
                      type="button"
                      className="btn-action-dots"
                      title="More actions"
                      onClick={() =>
                        alert(`Actions for record #${id} (CRUD will be handled later)`)
                      }
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
