export default function Toolbar({
  title,
  count,
  searchQuery,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onOpenFilter,
  activeFiltersCount = 0,
  onAddClick,
  singularTitle = 'Record',
}) {
  return (
    <div className="toolbar-container">
      {/* Title & Count Badge */}
      <div className="toolbar-title-wrap">
        <h2 className="toolbar-title">All {title.toLowerCase()}</h2>
        <span className="toolbar-count-badge">{count}</span>
      </div>

      {/* Toolbar Controls */}
      <div className="toolbar-actions">
        {/* Search Box */}
        <div className="search-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {/* Custom Record Per Page Dropdown */}
        <div className="per-page-select-wrap">
          <label htmlFor="perPageSelect" className="d-none d-sm-inline">
            Show:
          </label>
          <select
            id="perPageSelect"
            className="custom-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            title="Records per page"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* Filter Modal Trigger */}
        <button
          type="button"
          className={`btn-filter ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
          onClick={onOpenFilter}
        >
          <i className="bi bi-sliders2"></i>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="badge bg-purple text-white ms-1" style={{ backgroundColor: '#7f56d9' }}>
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Add Record Button */}
        <button
          type="button"
          className="btn-primary-action"
          onClick={onAddClick}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Add {singularTitle.toLowerCase()}</span>
        </button>
      </div>
    </div>
  )
}
