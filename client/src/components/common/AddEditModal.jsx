import { useState, useEffect, useRef } from 'react'
import { FOREIGN_KEY_MAP } from '../../config/routesConfig'

export default function AddEditModal({
  isOpen,
  mode = 'add', // 'add' | 'edit'
  entityKey,
  config,
  record = null,
  onClose,
  onSave,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const inputRefs = useRef({})

  const isEdit = mode === 'edit'
  const primaryKey = config?.primaryKey || 'id'
  const singularTitle = config?.singularTitle || 'Record'

  // Initialize or reset form state whenever modal opens or record changes
  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setGeneralError('')
      if (isEdit && record) {
        setFormData({ ...record })
      } else {
        const initial = {}
        config?.columns?.forEach((col) => {
          initial[col.key] = ''
        })
        setFormData(initial)
      }
    }
  }, [isOpen, mode, record, config])

  if (!isOpen || !config) return null

  // Value change handler
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
    // Clear field-level error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
    if (generalError) setGeneralError('')
  }

  // Validate form on frontend before submission
  const validateForm = () => {
    const newErrors = {}

    config.columns.forEach((col) => {
      const val = formData[col.key]
      const isPk = col.key === primaryKey || col.isPrimary

      // In edit mode, primary key is read-only so ignore
      if (isEdit && isPk) return

      // In add mode, if PK is left blank, backend or client will auto-generate
      if (!isEdit && isPk && (val === '' || val === undefined || val === null)) {
        return
      }

      // Check required fields (all non-PK fields)
      if (val === undefined || val === null || String(val).trim() === '') {
        newErrors[col.key] = `${col.label} is required.`
        return
      }

      // Check numeric constraints
      const isNumericField =
        col.key.endsWith('_id') ||
        col.key.includes('capacity') ||
        col.key.includes('count') ||
        col.key.includes('amount') ||
        col.key.includes('speed') ||
        col.key.includes('volume') ||
        col.key.includes('latitude') ||
        col.key.includes('longitude')

      if (isNumericField && val !== '') {
        const num = Number(val)
        if (isNaN(num)) {
          newErrors[col.key] = `${col.label} must be a valid number.`
        } else if (
          num < 0 &&
          !col.key.includes('latitude') &&
          !col.key.includes('longitude')
        ) {
          newErrors[col.key] = `${col.label} cannot be negative.`
        }
      }
    })

    return newErrors
  }

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    // 1. Run frontend validation
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)

      // Highlight and focus the first invalid field
      const firstInvalidKey = Object.keys(validationErrors)[0]
      if (inputRefs.current[firstInvalidKey]) {
        inputRefs.current[firstInvalidKey].focus()
        inputRefs.current[firstInvalidKey].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
      return
    }

    // 2. Prepare payload
    const payload = { ...formData }

    // Convert numbers
    config.columns.forEach((col) => {
      const val = payload[col.key]
      const isNumericField =
        col.key.endsWith('_id') ||
        col.key.includes('capacity') ||
        col.key.includes('count') ||
        col.key.includes('amount') ||
        col.key.includes('speed') ||
        col.key.includes('volume') ||
        col.key.includes('latitude') ||
        col.key.includes('longitude')

      if (isNumericField && val !== '' && val !== null && val !== undefined) {
        payload[col.key] = Number(val)
      }
    })

    // If PK was left blank in add mode, delete it so backend can auto-increment
    if (!isEdit && (payload[primaryKey] === '' || payload[primaryKey] === undefined)) {
      delete payload[primaryKey]
    }

    try {
      await onSave(payload)
    } catch (err) {
      // 3. Catch backend validation errors and highlight & focus related fields!
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors)
        const firstBackendKey = Object.keys(err.errors).find(
          (k) => inputRefs.current[k]
        )
        if (firstBackendKey && inputRefs.current[firstBackendKey]) {
          inputRefs.current[firstBackendKey].focus()
          inputRefs.current[firstBackendKey].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
        if (err.errors.general) {
          setGeneralError(err.errors.general)
        }
      } else {
        setGeneralError(err.message || 'An error occurred while saving the record.')
      }
    }
  }

  // Determine input type and options
  const renderFieldInput = (col) => {
    const isPk = col.key === primaryKey || col.isPrimary
    const isReadOnly = isEdit && isPk
    const hasError = Boolean(errors[col.key])
    const errorMessage = errors[col.key]
    const value = formData[col.key] ?? ''

    // Foreign key check
    const isFk = col.key !== primaryKey && (Boolean(FOREIGN_KEY_MAP[col.key]) || col.key.endsWith('_id'))
    const fkInfo = FOREIGN_KEY_MAP[col.key]

    // Date / Time detection
    const isDate = col.key.endsWith('_date')
    const isTime = col.key.endsWith('_time')
    const isTimestamp = col.key.includes('timestamp')
    const isNumeric =
      col.key.endsWith('_id') ||
      col.key.includes('capacity') ||
      col.key.includes('count') ||
      col.key.includes('amount') ||
      col.key.includes('speed') ||
      col.key.includes('volume') ||
      col.key.includes('latitude') ||
      col.key.includes('longitude')

    let inputType = 'text'
    if (isDate) inputType = 'date'
    else if (isTime) inputType = 'time'
    else if (isTimestamp) inputType = 'datetime-local'
    else if (isNumeric) inputType = 'number'

    // Status options for select dropdown
    const isStatusField = col.key === 'status' || col.key === 'fine_status' || col.key === 'availability' || col.key === 'response_status'
    let statusOptions = null
    if (col.key === 'status') {
      statusOptions = ['Active', 'Inactive', 'Operational', 'Stationed', 'On Route', 'Maintenance', 'Congested', 'Pending']
    } else if (col.key === 'fine_status') {
      statusOptions = ['Pending', 'Paid', 'Disputed', 'Waived']
    } else if (col.key === 'availability') {
      statusOptions = ['Available', 'Occupied', 'Maintenance']
    } else if (col.key === 'response_status') {
      statusOptions = ['Dispatched', 'In Transit', 'Arrived On Scene', 'Resolved']
    }

    return (
      <div className="mb-3" key={col.key}>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label
            htmlFor={`input-${col.key}`}
            className="form-label small fw-semibold text-secondary mb-0"
          >
            {col.label}
            {!isReadOnly && !(col.isPrimary && !isEdit) && (
              <span className="text-danger ms-1">*</span>
            )}
          </label>
          {isFk && (
            <span className="badge bg-light text-muted border small px-2 rounded-pill">
              Ref: {fkInfo?.label || col.label}
            </span>
          )}
          {isReadOnly && (
            <span className="badge bg-secondary-subtle text-secondary small px-2 py-0">
              Read-Only
            </span>
          )}
        </div>

        {statusOptions ? (
          <select
            id={`input-${col.key}`}
            ref={(el) => (inputRefs.current[col.key] = el)}
            className={`form-select form-select-sm ${hasError ? 'is-invalid' : ''}`}
            value={value}
            disabled={isSubmitting || isReadOnly}
            onChange={(e) => handleChange(col.key, e.target.value)}
          >
            <option value="">Select {col.label}...</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            {/* If current value isn't in default list, keep it visible */}
            {value && !statusOptions.includes(value) && (
              <option value={value}>{value}</option>
            )}
          </select>
        ) : (
          <input
            id={`input-${col.key}`}
            ref={(el) => (inputRefs.current[col.key] = el)}
            type={inputType}
            step={col.key.includes('latitude') || col.key.includes('longitude') ? '0.000001' : '1'}
            className={`form-control form-control-sm ${hasError ? 'is-invalid' : ''}`}
            placeholder={
              isReadOnly
                ? 'Primary Key (Generated)'
                : isPk && !isEdit
                ? ''
                : `Enter ${col.label.toLowerCase()}`
            }
            value={value}
            disabled={isSubmitting || isReadOnly}
            onChange={(e) => handleChange(col.key, e.target.value)}
          />
        )}

        {/* Validation error message below the input */}
        {hasError && (
          <div className="invalid-feedback d-block fw-semibold" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-exclamation-circle-fill me-1"></i>
            {errorMessage}
          </div>
        )}

        {isPk && !isEdit && !hasError && (
          <small className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
            Leave blank to let the system auto-assign the next available ID.
          </small>
        )}
      </div>
    )
  }

  return (
    <div
      className="custom-modal-backdrop"
      onClick={isSubmitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="custom-modal-dialog"
        style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="custom-modal-header">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-circle p-2 text-white"
              style={{ backgroundColor: isEdit ? '#175cd3' : '#7f56d9' }}
            >
              <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-lg'}`}></i>
            </span>
            <div>
              <h5 className="custom-modal-title mb-0">
                {isEdit ? `Edit ${singularTitle}` : `Add New ${singularTitle}`}
              </h5>
              {isEdit && (
                <small className="text-muted">
                  ID: #{record?.[primaryKey]} &bull; {config.title}
                </small>
              )}
            </div>
          </div>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Modal Body with Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            className="custom-modal-body"
            style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', padding: '20px 24px' }}
          >
            {/* General Error Banner inside form (No Toast) */}
            {generalError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0 text-danger fs-6"></i>
                <div>{generalError}</div>
              </div>
            )}

            <p className="text-muted small mb-3">
              {isEdit
                ? 'Update the fields below. Highlighted fields will alert if any values are invalid.'
                : 'Fill in the details to create a new record. All required fields are marked with *.'}
            </p>

            {/* Dynamically Render Inputs */}
            {config.columns.map((col) => renderFieldInput(col))}
          </div>

          {/* Modal Footer */}
          <div className="custom-modal-footer">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm text-white px-4 d-inline-flex align-items-center"
              style={{ backgroundColor: isEdit ? '#175cd3' : '#7f56d9' }}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              {isSubmitting
                ? isEdit
                  ? 'Updating...'
                  : 'Saving...'
                : isEdit
                ? `Update ${singularTitle}`
                : `Save ${singularTitle}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
