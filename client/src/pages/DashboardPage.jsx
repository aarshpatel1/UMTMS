import { Link } from 'react-router-dom'
import { NAV_GROUPS } from '../config/routesConfig'

export default function DashboardPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs-bar">
        <span className="breadcrumb-logo-badge">
          <i className="bi bi-grid text-white" style={{ fontSize: '0.65rem'}}></i>
        </span>
        <span>UMTMS</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Dashboard</span>
      </div>

      {/* Main Page Title */}
      <h1 className="page-title">Dashboard</h1>

      {/* Dashboard Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="content-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Total Entities</span>
              <span className="badge bg-light text-dark border">22 Modules</span>
            </div>
            <h3 className="fw-bold mb-1">Urban Mobility TMS</h3>
            <p className="text-muted small mb-0">
              Complete traffic management and mobility system
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="content-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Core Transit</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">Active</span>
            </div>
            <h3 className="fw-bold mb-1">Buses & Trains</h3>
            <p className="text-muted small mb-0">
              Integrated multi-modal public transit records
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="content-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Monitoring</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Real-time</span>
            </div>
            <h3 className="fw-bold mb-1">Sensors & Cameras</h3>
            <p className="text-muted small mb-0">
              Dynamic signal control and violations tracking
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Directory */}
      <div className="content-card p-4">
        <h4 className="fw-semibold mb-3">System Navigation Directory</h4>
        <div className="row g-3">
          {NAV_GROUPS.filter((g) => g.title !== 'GENERAL').map((group, idx) => (
            <div key={idx} className="col-12 col-md-6 col-xl-3">
              <h6 className="text-uppercase text-muted fw-bold small mb-2">
                {group.title}
              </h6>
              <ul className="list-unstyled mb-0">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="mb-2">
                    <Link
                      to={item.path}
                      className="d-flex align-items-center gap-2 text-decoration-none text-secondary"
                    >
                      <i className={`bi ${item.icon} text-primary`}></i>
                      <span className="fw-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
