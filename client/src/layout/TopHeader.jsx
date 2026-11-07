export default function TopHeader({ onToggleSidebar }) {
  return (
    <div className="mobile-topbar d-lg-none">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="fw-semibold text-dark">UMTMS</span>
      </div>
      <div>
        <span className="badge bg-light text-secondary border">UMTMS</span>
      </div>
    </div>
  )
}
