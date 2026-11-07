import React, { useState } from 'react'

export default function AreaTrendChart({
  data = [],
  height = 200,
  speedLabel = 'Speed (km/h)',
  volumeLabel = 'Traffic Volume',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-4 text-muted small" style={{ height }}>
        <i className="bi bi-graph-up text-secondary mb-2" style={{ fontSize: '1.8rem', opacity: 0.5 }}></i>
        <span>No trend records recorded</span>
      </div>
    )
  }

  const width = 600
  const chartH = 160
  const padL = 35
  const padR = 20
  const padT = 20
  const padB = 30

  const usableW = width - padL - padR
  const usableH = chartH - padT

  const maxSpeed = Math.max(...data.map((d) => Number(d.vehicle_speed) || 0), 100)
  const maxVolume = Math.max(...data.map((d) => Number(d.traffic_volume) || 0), 150)

  const pointsSpeed = data.map((d, i) => {
    const x = padL + (i / (data.length - 1 || 1)) * usableW
    const y = padT + usableH - ((Number(d.vehicle_speed) || 0) / maxSpeed) * usableH
    return { x, y, val: d.vehicle_speed, raw: d }
  })

  const pointsVolume = data.map((d, i) => {
    const x = padL + (i / (data.length - 1 || 1)) * usableW
    const y = padT + usableH - ((Number(d.traffic_volume) || 0) / maxVolume) * usableH
    return { x, y, val: d.traffic_volume, raw: d }
  })

  const pathVolume = pointsVolume.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  const areaVolume = `${pathVolume} L ${pointsVolume[pointsVolume.length - 1].x} ${padT + usableH} L ${pointsVolume[0].x} ${padT + usableH} Z`

  const pathSpeed = pointsSpeed.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')

  const activePoint = hoveredIdx !== null ? {
    speed: pointsSpeed[hoveredIdx],
    volume: pointsVolume[hoveredIdx],
    record: data[hoveredIdx],
  } : null

  return (
    <div className="area-trend-chart position-relative w-100">
      <div className="d-flex align-items-center justify-content-end gap-3 mb-2 small text-muted">
        <span className="d-inline-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
          <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#175cd3' }}></span>
          {volumeLabel}
        </span>
        <span className="d-inline-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
          <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#7f56d9' }}></span>
          {speedLabel}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${chartH + padB}`}
        className="w-100 h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#175cd3" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#175cd3" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = padT + usableH * (1 - pct)
          return (
            <line
              key={i}
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke="#eaecf0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )
        })}

        {/* Volume Area & Line */}
        <path d={areaVolume} fill="url(#volumeAreaGradient)" />
        <path d={pathVolume} fill="none" stroke="#175cd3" strokeWidth="2" strokeLinecap="round" />

        {/* Speed Line */}
        <path d={pathSpeed} fill="none" stroke="#7f56d9" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />

        {/* Hover vertical crosshair */}
        {activePoint && (
          <line
            x1={activePoint.volume.x}
            y1={padT}
            x2={activePoint.volume.x}
            y2={padT + usableH}
            stroke="#98a2b3"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        )}

        {/* Interactive points & hover listeners */}
        {pointsVolume.map((pv, i) => {
          const ps = pointsSpeed[i]
          const isHov = hoveredIdx === i

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible wide slice hit target */}
              <rect
                x={pv.x - usableW / (pointsVolume.length * 2)}
                y={padT}
                width={usableW / pointsVolume.length}
                height={usableH}
                fill="transparent"
              />

              {/* Volume Dot */}
              <circle
                cx={pv.x}
                cy={pv.y}
                r={isHov ? 5 : 3}
                fill="#ffffff"
                stroke="#175cd3"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: 'all 0.15s ease' }}
              />

              {/* Speed Dot */}
              <circle
                cx={ps.x}
                cy={ps.y}
                r={isHov ? 5 : 3}
                fill="#ffffff"
                stroke="#7f56d9"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: 'all 0.15s ease' }}
              />
            </g>
          )
        })}

        {/* X Axis Labels */}
        {pointsVolume.filter((_, i) => i === 0 || i === Math.floor(pointsVolume.length / 2) || i === pointsVolume.length - 1).map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartH + 18}
            textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
            fontSize="10"
            fill="#98a2b3"
            fontWeight="500"
          >
            Sample #{p.raw?.record_id || (i + 1)}
          </text>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && (
        <div
          className="position-absolute bg-dark text-white p-2 rounded shadow-sm"
          style={{
            top: '0px',
            right: '15px',
            fontSize: '0.76rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div className="fw-semibold text-truncate mb-1">Record #{activePoint.record.record_id}</div>
          <div className="d-flex align-items-center gap-2 text-info-emphasis">
            <span>Volume:</span>
            <strong>{activePoint.volume.val} veh</strong>
          </div>
          <div className="d-flex align-items-center gap-2 text-warning-emphasis">
            <span>Speed:</span>
            <strong>{activePoint.speed.val} km/h</strong>
          </div>
        </div>
      )}
    </div>
  )
}
