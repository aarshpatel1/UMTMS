/**
 * Date and Timestamp Formatting Utilities
 * Formats:
 * - Dates: DD-MM-YYYY (e.g. 01-01-2026)
 * - Timestamps: DD-MM-YYYY HH:mm:ss (e.g. 01-01-2026 06:15:00)
 */

export function formatDate(val) {
  if (val === null || val === undefined || val === '') return '—'

  // Already in DD-MM-YYYY format
  if (typeof val === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(val.trim())) {
    return val.trim()
  }

  // YYYY-MM-DD
  const m = typeof val === 'string' && val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) {
    const [, y, mo, d] = m
    return `${d.padStart(2, '0')}-${mo.padStart(2, '0')}-${y}`
  }

  // Parse as Date object
  const dObj = new Date(val)
  if (!isNaN(dObj.getTime())) {
    const d = String(dObj.getDate()).padStart(2, '0')
    const mo = String(dObj.getMonth() + 1).padStart(2, '0')
    const y = dObj.getFullYear()
    return `${d}-${mo}-${y}`
  }

  return String(val)
}

export function formatDateTime(val) {
  if (val === null || val === undefined || val === '') return '—'

  // Already in DD-MM-YYYY HH:mm:ss format
  if (typeof val === 'string' && /^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(val.trim())) {
    return val.trim()
  }

  // YYYY-MM-DD HH:mm:ss or ISO 8601 YYYY-MM-DDTHH:mm:ss
  const m = typeof val === 'string' && val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2}):(\d{1,2})/)
  if (m) {
    const [, y, mo, d, hh, mm, ss] = m
    return `${d.padStart(2, '0')}-${mo.padStart(2, '0')}-${y} ${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`
  }

  // Parse as Date object
  const dObj = new Date(val)
  if (!isNaN(dObj.getTime())) {
    const d = String(dObj.getDate()).padStart(2, '0')
    const mo = String(dObj.getMonth() + 1).padStart(2, '0')
    const y = dObj.getFullYear()
    const hh = String(dObj.getHours()).padStart(2, '0')
    const mm = String(dObj.getMinutes()).padStart(2, '0')
    const ss = String(dObj.getSeconds()).padStart(2, '0')
    return `${d}-${mo}-${y} ${hh}:${mm}:${ss}`
  }

  return String(val)
}

export function formatCellDisplay(key, val) {
  if (val === null || val === undefined || val === '') return '—'

  const lowerKey = key.toLowerCase()

  if (lowerKey === 'timestamp' || lowerKey.includes('timestamp')) {
    return formatDateTime(val)
  }

  if (lowerKey === 'record_date' || lowerKey === 'violation_date' || lowerKey.endsWith('_date')) {
    return formatDate(val)
  }

  return String(val)
}
