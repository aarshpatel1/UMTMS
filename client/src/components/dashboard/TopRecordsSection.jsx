import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, formatDateTime } from '../../utils/formatters'

export default function TopRecordsSection({
  topViolations = [],
  topMonitoring = [],
  topEmergencies = [],
  topTransit = [],
  tablesSummary = [],
}) {
  const [activeTab, setActiveTab] = useState('violations')

  const tabs = [
    { id: 'violations', label: 'Highest Violations', icon: 'bi-exclamation-triangle', count: topViolations.length, link: '/traffic-violations' },
    { id: 'monitoring', label: 'Peak Traffic Hotspots', icon: 'bi-speedometer2', count: topMonitoring.length, link: '/traffic-monitoring-records' },
    { id: 'emergencies', label: 'Emergency Dispatches', icon: 'bi-truck', count: topEmergencies.length, link: '/emergency-responses' },
    { id: 'transit', label: 'Transit Fleet Highlights', icon: 'bi-bus-front', count: topTransit.length, link: '/buses' },
    { id: 'catalog', label: 'Full Database Catalog (22)', icon: 'bi-database-check', count: tablesSummary.length, link: '/dashboard' },
  ]

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'PAID' || s === 'AVAILABLE' || s === 'ACTIVE' || s === 'COMPLETED') {
      return <span className="badge-custom badge-green">{s}</span>
    }
    if (s === 'PENDING' || s === 'IN_PROGRESS' || s === 'BUSY') {
      return <span className="badge-custom badge-amber">{s}</span>
    }
    if (s === 'UNPAID' || s === 'CANCELLED' || s === 'INACTIVE') {
      return <span className="badge-custom badge-red">{s}</span>
    }
    if (s === 'DISPATCHED' || s === 'AMBULANCE') {
      return <span className="badge-custom badge-blue">{s}</span>
    }
    return <span className="badge-custom badge-gray">{s || '—'}</span>
  }

  return (
    <div className="content-card mb-4">
      {/* Header and Tabs */}
      <div className="border-bottom p-3 pb-0 bg-light-subtle">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-stars text-primary"></i>
              Key Database Records & Top Entities
            </h5>
            <p className="text-muted small mb-0">
              Live highlights of highest penalties, traffic hotspots, active response teams, and database tables
            </p>
          </div>
          {tabs.find((t) => t.id === activeTab)?.link && (
            <Link
              to={tabs.find((t) => t.id === activeTab).link}
              className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5"
            >
              <span>View Full Table</span>
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          )}
        </div>

        {/* Tab Pills */}
        <ul className="nav nav-tabs border-0 flex-nowrap overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <li className="nav-item flex-shrink-0" key={tab.id}>
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-2 rounded-0 pb-2 px-3 fw-semibold small ${
                  activeTab === tab.id
                    ? 'active text-primary border-primary bg-transparent'
                    : 'text-secondary border-transparent bg-transparent'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon} me-2`}></i>
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ms-2 badge rounded-pill ${
                      activeTab === tab.id ? 'bg-primary text-white' : 'bg-light text-muted border'
                    }`}
                    style={{ fontSize: '0.68rem' }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Panels */}
      <div className="p-0">
        {/* Tab 1: Top Violations */}
        {activeTab === 'violations' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 data-table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Violation Type</th>
                  <th>Vehicle Plate</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Authority</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {topViolations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No violations recorded
                    </td>
                  </tr>
                ) : (
                  topViolations.map((v) => (
                    <tr key={v.violation_id}>
                      <td>
                        <span className="font-monospace fw-semibold text-secondary">
                          #{v.violation_id}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">
                          {String(v.violation_type || '').replace(/_/g, ' ')}
                        </span>
                        {v.vehicle_type && (
                          <span className="badge bg-light text-muted border ms-2 small">
                            {v.vehicle_type}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-monospace fw-medium text-primary">
                          {v.registration_number || 'GJ-REG-XXXX'}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-danger">
                          ₹{Number(v.fine_amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>{getStatusBadge(v.fine_status)}</td>
                      <td className="small text-muted">
                        {formatDate(v.violation_date)} {v.violation_time || ''}
                      </td>
                      <td className="small text-secondary">
                        {v.authority_name || `Authority #${v.authority_id || '1'}`}
                      </td>
                      <td className="text-end">
                        <Link
                          to="/traffic-violations"
                          className="btn btn-sm btn-light border py-0.5 px-2 text-decoration-none"
                          title="Inspect Violation"
                        >
                          <i className="bi bi-box-arrow-up-right text-muted"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Top Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 data-table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Record</th>
                  <th>Road</th>
                  <th>Road Type</th>
                  <th>Traffic Volume</th>
                  <th>Vehicle Speed</th>
                  <th>Sensor / Camera</th>
                  <th>Recorded At</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {topMonitoring.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No monitoring records found
                    </td>
                  </tr>
                ) : (
                  topMonitoring.map((m) => (
                    <tr key={m.record_id}>
                      <td>
                        <span className="font-monospace fw-semibold text-secondary">
                          #{m.record_id}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">
                          {m.road_name || `Road #${m.road_id}`}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {m.road_type || 'ARTERIAL'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark">{m.traffic_volume} veh/hr</span>
                          <div className="progress flex-grow-1" style={{ width: '60px', height: '6px' }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${Math.min((m.traffic_volume / 150) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`fw-semibold ${
                            Number(m.vehicle_speed) > 90
                              ? 'text-danger'
                              : Number(m.vehicle_speed) > 60
                              ? 'text-warning'
                              : 'text-success'
                          }`}
                        >
                          {m.vehicle_speed} km/h
                        </span>
                      </td>
                      <td className="small text-muted">
                        <span className="badge bg-light text-muted border me-1">
                          {m.sensor_type || 'LOOP'}
                        </span>
                        <span className="badge bg-light text-muted border">
                          {m.camera_type || 'CCTV'}
                        </span>
                      </td>
                      <td className="small text-muted">{formatDateTime(m.timestamp)}</td>
                      <td className="text-end">
                        <Link
                          to="/traffic-monitoring-records"
                          className="btn btn-sm btn-light border py-0.5 px-2 text-decoration-none"
                        >
                          <i className="bi bi-box-arrow-up-right text-muted"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Emergencies */}
        {activeTab === 'emergencies' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 data-table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '90px' }}>Response ID</th>
                  <th>Incident Status</th>
                  <th>Assigned Vehicle</th>
                  <th>Vehicle Status</th>
                  <th>Location Coordinates</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {topEmergencies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No emergency records
                    </td>
                  </tr>
                ) : (
                  topEmergencies.map((e) => (
                    <tr key={e.response_id}>
                      <td>
                        <span className="font-monospace fw-semibold text-secondary">
                          RESP-{e.response_id}
                        </span>
                      </td>
                      <td>{getStatusBadge(e.response_status)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i
                            className={`bi ${
                              e.vehicle_type === 'FIRE_ENGINE'
                                ? 'bi-fire text-danger'
                                : e.vehicle_type === 'POLICE_VAN'
                                ? 'bi-shield-shaded text-primary'
                                : 'bi-hospital text-danger'
                            }`}
                          ></i>
                          <span className="fw-semibold text-dark">
                            {e.vehicle_type || 'AMBULANCE'}
                          </span>
                          <span className="text-muted small">#{e.emergency_id}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(e.vehicle_status)}</td>
                      <td className="small font-monospace text-muted">
                        {e.latitude && e.longitude
                          ? `${Number(e.latitude).toFixed(3)}, ${Number(e.longitude).toFixed(3)}`
                          : 'Grid Sector A'}
                      </td>
                      <td className="text-end">
                        <Link
                          to="/emergency-responses"
                          className="btn btn-sm btn-light border py-0.5 px-2 text-decoration-none"
                        >
                          <i className="bi bi-box-arrow-up-right text-muted"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Transit Fleet */}
        {activeTab === 'transit' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 data-table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Mode</th>
                  <th>Route / Unit</th>
                  <th>Passenger Capacity</th>
                  <th>Scheduled Departure</th>
                  <th>Scheduled Arrival</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {topTransit.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No transit data available
                    </td>
                  </tr>
                ) : (
                  topTransit.map((t, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="badge-custom badge-purple">{t.type}</span>
                      </td>
                      <td>
                        <span className="fw-bold font-monospace text-dark">
                          {t.identifier || `Unit #${t.transit_unit_id}`}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold text-dark">{t.capacity} seats</span>
                          <div className="progress flex-grow-1" style={{ width: '60px', height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${Math.min((t.capacity / 70) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="small font-monospace text-secondary">
                        {t.departure_time || '08:00:00'}
                      </td>
                      <td className="small font-monospace text-secondary">
                        {t.arrival_time || '09:00:00'}
                      </td>
                      <td className="text-end">
                        <Link
                          to="/buses"
                          className="btn btn-sm btn-light border py-0.5 px-2 text-decoration-none"
                        >
                          <i className="bi bi-box-arrow-up-right text-muted"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Complete Database Table Inventory (All 22 Tables) */}
        {activeTab === 'catalog' && (
          <div className="p-3">
            <div className="row g-3">
              {tablesSummary.map((t) => (
                <div key={t.key} className="col-12 col-md-6 col-lg-4 col-xl-3">
                  <div className="border rounded-3 p-3 bg-white h-100 d-flex flex-column justify-content-between hover-shadow">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span
                          className="d-flex align-items-center justify-content-center rounded-2 bg-light text-primary border"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <i className={`bi ${t.icon}`}></i>
                        </span>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">
                          {t.count} records
                        </span>
                      </div>
                      <h6 className="fw-bold mb-1 text-dark text-truncate" title={t.label}>
                        {t.label}
                      </h6>
                      <div className="text-muted small mb-3 text-truncate font-monospace" style={{ fontSize: '0.75rem' }}>
                        {t.table}
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                      <span className="badge-custom badge-gray small" style={{ fontSize: '0.68rem' }}>
                        {t.category}
                      </span>
                      <Link
                        to={t.path}
                        className="btn btn-sm btn-outline-primary py-0.5 px-2 text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Explore <i className="bi bi-chevron-right ms-0.5"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
