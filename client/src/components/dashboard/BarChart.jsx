import React, { useState } from 'react'

export default function BarChart({
  data = [],
  height = 240,
  barColor = '#7f56d9',
  valuePrefix = '',
  valueSuffix = '',
  secondaryLabel = '',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-4 text-muted small" style={{ height }}>
        <i className="bi bi-bar-chart text-secondary mb-2" style={{ fontSize: '1.8rem', opacity: 0.5 }}></i>
        <span>No chart data available</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1)
  const chartHeight = 180
  const chartWidth = 500
  const paddingLeft = 45
  const paddingBottom = 40
  const paddingTop = 20
  const paddingRight = 15

  const usableWidth = chartWidth - paddingLeft - paddingRight
  const usableHeight = chartHeight - paddingTop

  const barWidth = Math.min(usableWidth / data.length * 0.6, 36)
  const step = usableWidth / data.length

  // Y-axis grid steps (4 steps)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round(pct * maxValue))

  return (
    <div className="bar-chart-container position-relative w-100">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
        className="w-100 h-auto"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="1" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#101828" stopOpacity="1" />
            <stop offset="100%" stopColor="#344054" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Y Grid Lines & Labels */}
        {yTicks.map((tickVal, i) => {
          const y = paddingTop + usableHeight - (tickVal / maxValue) * usableHeight
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#eaecf0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="#98a2b3"
                fontWeight="500"
              >
                {valuePrefix}{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : tickVal}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const val = Number(item.value) || 0
          const barH = Math.max((val / maxValue) * usableHeight, 2)
          const x = paddingLeft + idx * step + (step - barWidth) / 2
          const y = paddingTop + usableHeight - barH
          const isHovered = hoveredIdx === idx

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible wider hover hit target */}
              <rect
                x={paddingLeft + idx * step}
                y={paddingTop}
                width={step}
                height={usableHeight}
                fill="transparent"
              />

              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="4"
                fill={isHovered ? 'url(#barGradientHover)' : (item.color || 'url(#barGradientPrimary)')}
                style={{
                  transition: 'y 0.25s ease, height 0.25s ease, fill 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))' : 'none',
                }}
              />

              {/* Top value label on hover */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#101828"
                >
                  {valuePrefix}{val.toLocaleString()}{valueSuffix}
                </text>
              )}

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fontSize="10"
                fill={isHovered ? '#101828' : '#667085'}
                fontWeight={isHovered ? '600' : '500'}
                style={{ transition: 'fill 0.2s ease' }}
              >
                {item.label?.length > 10 ? `${item.label.substring(0, 9)}…` : item.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Floating Tooltip if Hovered */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="position-absolute bg-dark text-white p-2 rounded shadow-sm text-center"
          style={{
            bottom: '10px',
            right: '15px',
            fontSize: '0.78rem',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '130px',
          }}
        >
          <div className="fw-semibold text-truncate">{data[hoveredIdx].label}</div>
          <div className="text-light">
            Count: <strong className="text-white">{valuePrefix}{data[hoveredIdx].value.toLocaleString()}{valueSuffix}</strong>
          </div>
          {data[hoveredIdx].subtext && (
            <div className="text-warning-emphasis small mt-0.5" style={{ fontSize: '0.72rem' }}>
              {data[hoveredIdx].subtext}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
