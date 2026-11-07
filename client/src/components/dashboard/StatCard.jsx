import React from 'react'

export default function StatCard({
  title,
  value,
  subvalue,
  icon,
  badgeText,
  badgeVariant = 'gray',
  trend,
  trendLabel,
  trendDirection = 'neutral',
  color = 'purple',
  onClick,
}) {
  const colorMap = {
    purple: {
      iconBg: '#f9f5ff',
      iconColor: '#7f56d9',
      borderColor: '#e9d7fe',
      accentGlow: 'rgba(127, 86, 217, 0.08)',
    },
    blue: {
      iconBg: '#eff8ff',
      iconColor: '#175cd3',
      borderColor: '#b2ddff',
      accentGlow: 'rgba(23, 92, 211, 0.08)',
    },
    green: {
      iconBg: '#ecfdf3',
      iconColor: '#027a48',
      borderColor: '#abefc6',
      accentGlow: 'rgba(2, 122, 72, 0.08)',
    },
    amber: {
      iconBg: '#fffaeb',
      iconColor: '#b54708',
      borderColor: '#fedf89',
      accentGlow: 'rgba(181, 71, 8, 0.08)',
    },
    red: {
      iconBg: '#fef3f2',
      iconColor: '#b42318',
      borderColor: '#fecdca',
      accentGlow: 'rgba(180, 35, 24, 0.08)',
    },
    indigo: {
      iconBg: '#eef4ff',
      iconColor: '#3538cd',
      borderColor: '#c7d7fe',
      accentGlow: 'rgba(53, 56, 205, 0.08)',
    },
  }

  const currentTheme = colorMap[color] || colorMap.purple

  return (
    <div
      className="dashboard-stat-card content-card p-3 h-100 position-relative"
      style={{
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="stat-card-title text-muted small fw-semibold text-uppercase tracking-wider">
          {title}
        </span>
        <div
          className="stat-icon-pill d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: '38px',
            height: '38px',
            backgroundColor: currentTheme.iconBg,
            color: currentTheme.iconColor,
            border: `1px solid ${currentTheme.borderColor}`,
          }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: '1.15rem' }}></i>
        </div>
      </div>

      <div className="d-flex align-items-baseline gap-2 mb-1">
        <h2 className="stat-value fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
          {value}
        </h2>
        {badgeText && (
          <span
            className={`badge-custom badge-${badgeVariant} px-2 py-0.5`}
            style={{ fontSize: '0.72rem', fontWeight: 600 }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {(subvalue || trend) && (
        <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-light-subtle">
          {subvalue && (
            <span className="text-muted small text-truncate" title={subvalue} style={{ fontSize: '0.78rem' }}>
              {subvalue}
            </span>
          )}
          {trend && (
            <span
              className={`small fw-semibold d-inline-flex align-items-center gap-1 ms-auto ${
                trendDirection === 'up'
                  ? 'text-success'
                  : trendDirection === 'down'
                  ? 'text-danger'
                  : 'text-secondary'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {trendDirection === 'up' && <i className="bi bi-arrow-up-short"></i>}
              {trendDirection === 'down' && <i className="bi bi-arrow-down-short"></i>}
              {trend} {trendLabel && <span className="text-muted fw-normal"> {trendLabel}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
