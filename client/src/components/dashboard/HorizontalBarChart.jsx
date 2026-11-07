import React from 'react'

export default function HorizontalBarChart({
  data = [],
  title = '',
  total = null,
  color = '#7f56d9',
  valuePrefix = '',
  valueSuffix = '',
}) {
  if (!data || data.length === 0) {
    return <div className="text-muted small py-3 text-center">No category data</div>
  }

  const calculatedTotal = total || data.reduce((acc, curr) => acc + Number(curr.value || 0), 0)
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1)

  return (
    <div className="horizontal-bar-chart d-flex flex-column gap-3 w-100">
      {data.map((item, idx) => {
        const val = Number(item.value) || 0
        const percent = calculatedTotal > 0 ? ((val / calculatedTotal) * 100).toFixed(1) : 0
        const barWidth = `${Math.min(Math.max((val / maxValue) * 100, 3), 100)}%`
        const itemColor = item.color || color

        return (
          <div key={idx} className="category-bar-item">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center gap-2 text-truncate me-2">
                {item.icon && (
                  <i className={`bi ${item.icon} text-muted`} style={{ fontSize: '0.9rem' }}></i>
                )}
                <span className="small fw-semibold text-dark text-truncate" title={item.label}>
                  {item.label}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="fw-bold small text-dark" style={{ fontSize: '0.84rem' }}>
                  {valuePrefix}{val.toLocaleString()}{valueSuffix}
                </span>
                <span className="badge bg-light text-muted border px-1.5 py-0.5" style={{ fontSize: '0.7rem' }}>
                  {percent}%
                </span>
              </div>
            </div>

            {/* Track & Bar */}
            <div
              className="progress"
              style={{
                height: '8px',
                backgroundColor: '#f2f4f7',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: barWidth,
                  backgroundColor: itemColor,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }}
                aria-valuenow={val}
                aria-valuemin="0"
                aria-valuemax={maxValue}
              ></div>
            </div>

            {item.subtext && (
              <div className="text-muted text-end small mt-0.5" style={{ fontSize: '0.72rem' }}>
                {item.subtext}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
