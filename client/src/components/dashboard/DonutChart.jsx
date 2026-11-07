import React, { useState } from 'react'

export default function DonutChart({
  data = [],
  title = '',
  totalLabel = 'Total',
  centerValue = null,
  size = 200,
  strokeWidth = 32,
  colors = ['#7f56d9', '#175cd3', '#027a48', '#f79009', '#f04438', '#98a2b3'],
  showLegend = true,
  height = 240,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const validData = data.filter((d) => Number(d.value) > 0)
  const total = validData.reduce((acc, curr) => acc + Number(curr.value), 0)

  if (!validData.length || total === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-4 text-muted small" style={{ height }}>
        <i className="bi bi-pie-chart text-secondary mb-2" style={{ fontSize: '1.8rem', opacity: 0.5 }}></i>
        <span>No distribution data available</span>
      </div>
    )
  }

  const radius = size / 2 - strokeWidth
  const center = size / 2

  let cumulativeAngle = -90 // Start at top

  const segments = validData.map((item, index) => {
    const fraction = Number(item.value) / total
    const angle = fraction * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    cumulativeAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0
    const color = item.color || colors[index % colors.length]
    const percent = (fraction * 100).toFixed(1)

    // SVG path for annular sector
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`

    return {
      pathData,
      color,
      fraction,
      percent,
      label: item.label,
      value: item.value,
      subtext: item.subtext,
    }
  })

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null

  return (
    <div className="donut-chart-wrapper d-flex flex-column flex-sm-row align-items-center justify-content-around gap-3">
      {/* SVG Container */}
      <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f2f4f7"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <path
                key={idx}
                d={seg.pathData}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Center Text Info */}
        <div
          className="position-absolute d-flex flex-column align-items-center justify-content-center text-center pointer-events-none px-2"
          style={{ width: (radius - strokeWidth / 2) * 2, height: (radius - strokeWidth / 2) * 2 }}
        >
          {activeSegment ? (
            <>
              <span className="fw-bold text-dark text-truncate w-100" style={{ fontSize: '1.15rem' }}>
                {activeSegment.value.toLocaleString()}
              </span>
              <span className="text-muted small fw-semibold text-truncate w-100" style={{ fontSize: '0.72rem' }}>
                {activeSegment.label}
              </span>
              <span className="badge bg-light text-dark border mt-1" style={{ fontSize: '0.68rem' }}>
                {activeSegment.percent}%
              </span>
            </>
          ) : (
            <>
              <span className="fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
                {centerValue !== null ? centerValue : total.toLocaleString()}
              </span>
              <span className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>
                {totalLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="donut-legend flex-grow-1 ps-sm-3" style={{ maxWidth: '280px' }}>
          <div className="d-flex flex-column gap-2">
            {segments.map((seg, idx) => {
              const isHovered = hoveredIndex === idx
              return (
                <div
                  key={idx}
                  className={`d-flex align-items-center justify-content-between p-1 px-2 rounded-2 ${
                    isHovered ? 'bg-light' : ''
                  }`}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate me-2">
                    <span
                      className="d-inline-block rounded-circle flex-shrink-0"
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: seg.color,
                      }}
                    ></span>
                    <span
                      className="small text-truncate"
                      style={{
                        fontWeight: isHovered ? 600 : 500,
                        color: isHovered ? '#101828' : '#475467',
                        fontSize: '0.82rem',
                      }}
                      title={seg.label}
                    >
                      {seg.label}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <span className="fw-bold small text-dark" style={{ fontSize: '0.82rem' }}>
                      {Number(seg.value).toLocaleString()}
                    </span>
                    <span className="badge bg-light-subtle text-muted border px-1" style={{ fontSize: '0.68rem' }}>
                      {seg.percent}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
