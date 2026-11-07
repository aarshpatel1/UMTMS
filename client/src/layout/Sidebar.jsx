import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../config/routesConfig'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <div className="brand-icon">
              <i className="bi bi-grid-fill"></i>
            </div>
            <span>UMTMS</span>
          </NavLink>

          {/* Close button for mobile */}
          <button
            type="button"
            className="btn btn-sm d-lg-none text-muted"
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="sidebar-scrollable">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="mb-3">
              <div className="sidebar-section-title">{group.title}</div>
              <nav className="nav flex-column">
                {group.items.map((item, iIdx) => (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <div className="sidebar-link-content">
                      <span className="sidebar-link-icon">
                        <i className={`bi ${item.icon}`}></i>
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="sidebar-footer">
          <nav className="nav flex-column">
            <a
              href="#settings"
              className="sidebar-link"
              onClick={(e) => {
                e.preventDefault()
                alert('Settings will be configured in the next phase.')
              }}
            >
              <div className="sidebar-link-content">
                <span className="sidebar-link-icon">
                  <i className="bi bi-gear"></i>
                </span>
                <span>Settings</span>
              </div>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="sidebar-link"
            >
              <div className="sidebar-link-content">
                <span className="sidebar-link-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </span>
                <span>Documentation</span>
              </div>
            </a>
            <a
              href="/"
              className="sidebar-link"
            >
              <div className="sidebar-link-content">
                <span className="sidebar-link-icon">
                  <i className="bi bi-box-arrow-up-right"></i>
                </span>
                <span>Open in browser</span>
              </div>
            </a>
          </nav>
        </div>
      </aside>
    </>
  )
}
