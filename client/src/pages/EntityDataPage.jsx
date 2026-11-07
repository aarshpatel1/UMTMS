import { useState, useEffect, useMemo } from "react";
import { ENTITIES_CONFIG } from "../config/routesConfig";
import { fetchEntityRecords, fetchRecordById } from "../api/apiClient";
import Toolbar from "../components/common/Toolbar";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import FilterModal from "../components/common/FilterModal";
import RelatedRecordModal from "../components/common/RelatedRecordModal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import ErrorAlert from "../components/common/ErrorAlert";

export default function EntityDataPage({ entityKey }) {
	const config = ENTITIES_CONFIG[entityKey];

	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFallback, setIsFallback] = useState(false);

	// Search & Filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState(null);
	const [filterModalOpen, setFilterModalOpen] = useState(false);

	// Nested Overlay Modal Stack state
	const [modalStack, setModalStack] = useState([]);

	// Sort state
	const [sortColumn, setSortColumn] = useState(
		config ? config.columns[0]?.key : "",
	);
	const [sortDirection, setSortDirection] = useState("asc");

	// Pagination state
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	// Load records on entity change
	const loadRecords = async () => {
		if (!config) return;
		setLoading(true);
		setError(null);

		try {
			const res = await fetchEntityRecords(entityKey);
			setRecords(res.data || []);
			setIsFallback(res.isFallback || false);
			if (res.isFallback && res.errorMessage) {
				setError(res.errorMessage);
			}
		} catch (err) {
			setError(err.message);
			setRecords(config.fallbackData || []);
			setIsFallback(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadRecords();
		setSearchQuery("");
		setActiveFilter(null);
		setModalStack([]);
		setCurrentPage(1);
		if (config) {
			setSortColumn(config.columns[0]?.key || "");
			setSortDirection("asc");
		}
	}, [entityKey]);

	// Open related record modal (supports arbitrary stack depth)
	const handleOpenRelated = (targetEntityKey, targetId, label) => {
		const newModal = {
			entityKey: targetEntityKey,
			id: targetId,
			label,
			loading: true,
			record: null,
			error: null,
		};

		setModalStack((prev) => [...prev, newModal]);

		// Asynchronously fetch the related record
		fetchRecordById(targetEntityKey, targetId)
			.then((res) => {
				setModalStack((prev) => {
					const updated = [...prev];
					const targetIndex = updated.findIndex(
						(m) =>
							m.entityKey === targetEntityKey &&
							String(m.id) === String(targetId),
					);
					if (targetIndex !== -1) {
						updated[targetIndex] = {
							...updated[targetIndex],
							loading: false,
							record: res.data,
						};
					}
					return updated;
				});
			})
			.catch((err) => {
				setModalStack((prev) => {
					const updated = [...prev];
					const targetIndex = updated.findIndex(
						(m) =>
							m.entityKey === targetEntityKey &&
							String(m.id) === String(targetId),
					);
					if (targetIndex !== -1) {
						updated[targetIndex] = {
							...updated[targetIndex],
							loading: false,
							error: err.message,
						};
					}
					return updated;
				});
			});
	};

	// Close the topmost modal in the stack
	const handleCloseTopModal = () => {
		setModalStack((prev) => prev.slice(0, -1));
	};

	// Close all stacked modals
	const handleCloseAllModals = () => {
		setModalStack([]);
	};

	// Handle Sort
	const handleSort = (colKey) => {
		if (sortColumn === colKey) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(colKey);
			setSortDirection("asc");
		}
		setCurrentPage(1);
	};

	// Handle Page Size Change
	const handlePageSizeChange = (newSize) => {
		setPageSize(newSize);
		setCurrentPage(1);
	};

	// Filtered and sorted data
	const filteredRecords = useMemo(() => {
		let result = [...records];

		// 1. Apply column-specific filter if present
		if (activeFilter && activeFilter.value) {
			const { column, operator, value } = activeFilter;
			const filterLower = String(value).toLowerCase();

			result = result.filter((item) => {
				const itemVal = item[column];
				if (itemVal === null || itemVal === undefined) return false;
				const strVal = String(itemVal).toLowerCase();

				switch (operator) {
					case "equals":
						return strVal === filterLower;
					case "starts_with":
						return strVal.startsWith(filterLower);
					case "ends_with":
						return strVal.endsWith(filterLower);
					case "contains":
					default:
						return strVal.includes(filterLower);
				}
			});
		}

		// 2. Apply search box query across all columns
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			result = result.filter((item) => {
				return Object.values(item).some((val) => {
					if (val === null || val === undefined) return false;
					return String(val).toLowerCase().includes(q);
				});
			});
		}

		// 3. Apply sorting
		if (sortColumn) {
			result.sort((a, b) => {
				const aVal = a[sortColumn];
				const bVal = b[sortColumn];

				if (aVal === bVal) return 0;
				if (aVal === null || aVal === undefined) return 1;
				if (bVal === null || bVal === undefined) return -1;

				// Number comparison if both are numeric
				if (!isNaN(aVal) && !isNaN(bVal)) {
					return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
				}

				// String comparison
				const aStr = String(aVal).toLowerCase();
				const bStr = String(bVal).toLowerCase();
				if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
				if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [records, activeFilter, searchQuery, sortColumn, sortDirection]);

	// Pagination calculation
	const totalRecords = filteredRecords.length;
	const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

	// Ensure currentPage is within bounds
	const safeCurrentPage = Math.min(currentPage, totalPages);

	const paginatedData = useMemo(() => {
		const start = (safeCurrentPage - 1) * pageSize;
		return filteredRecords.slice(start, start + pageSize);
	}, [filteredRecords, safeCurrentPage, pageSize]);

	if (!config) {
		return (
			<div className="alert alert-danger">
				Entity configuration for &quot;{entityKey}&quot; was not found.
			</div>
		);
	}

	return (
		<div>
			{/* Breadcrumbs Navigation */}
			<div className="d-flex align-items-center justify-content-between flex-row-reverse">
				<div className="breadcrumbs-bar">
					{/* <span className="breadcrumb-logo-badge">
          <i
            className="bi bi-layers-fill text-white"
            style={{ fontSize: '0.65rem' }}
          ></i>
        </span> */}
					<span>UMTMS</span>
					<span className="breadcrumb-separator">›</span>
					<span>{config.category}</span>
					<span className="breadcrumb-separator">›</span>
					<span className="breadcrumb-current">{config.title}</span>
				</div>

				{/* Main Page Header */}
				<h1 className="page-title">{config.title}</h1>
			</div>

			{/* Main Content Card Container */}
			<div className="content-card">
				{/* Error Alert / Offline Banner if server is unreachable */}
				{error && (
					<ErrorAlert
						message={error}
						isFallback={isFallback}
						onRetry={loadRecords}
					/>
				)}

				{/* Reusable Toolbar */}
				<Toolbar
					title={config.title}
					singularTitle={config.singularTitle}
					count={totalRecords}
					searchQuery={searchQuery}
					onSearchChange={(q) => {
						setSearchQuery(q);
						setCurrentPage(1);
					}}
					pageSize={pageSize}
					onPageSizeChange={handlePageSizeChange}
					onOpenFilter={() => setFilterModalOpen(true)}
					activeFiltersCount={activeFilter ? 1 : 0}
					onAddClick={() => {
						alert(
							`Add ${config.singularTitle} modal will be available when CRUD operations are enabled.`,
						);
					}}
				/>

				{/* Active Filter Pill Bar */}
				{activeFilter && (
					<div className="active-filters-bar">
						<span className="text-muted fw-semibold">Filtered by:</span>
						<span className="filter-tag-pill">
							<strong>
								{config.columns.find((c) => c.key === activeFilter.column)
									?.label || activeFilter.column}
								:
							</strong>{" "}
							{activeFilter.operator} &quot;{activeFilter.value}&quot;
							<button
								type="button"
								className="filter-tag-remove"
								onClick={() => {
									setActiveFilter(null);
									setCurrentPage(1);
								}}
								aria-label="Remove filter"
							>
								<i className="bi bi-x-circle-fill"></i>
							</button>
						</span>

						<button
							type="button"
							className="btn btn-link btn-sm p-0 text-muted"
							onClick={() => {
								setActiveFilter(null);
								setCurrentPage(1);
							}}
						>
							Clear filter
						</button>
					</div>
				)}

				{/* Table Content or Loading Skeleton */}
				{loading ? (
					<LoadingSkeleton />
				) : (
					<>
						<DataTable
							columns={config.columns}
							data={paginatedData}
							primaryKey={config.primaryKey}
							currentEntityKey={entityKey}
							sortColumn={sortColumn}
							sortDirection={sortDirection}
							onSort={handleSort}
							onOpenRelated={handleOpenRelated}
						/>

						{/* Pagination Controls */}
						<Pagination
							currentPage={safeCurrentPage}
							totalPages={totalPages}
							totalRecords={totalRecords}
							pageSize={pageSize}
							onPageChange={(page) => setCurrentPage(page)}
						/>
					</>
				)}
			</div>

			{/* Filter Modal */}
			<FilterModal
				isOpen={filterModalOpen}
				onClose={() => setFilterModalOpen(false)}
				columns={config.columns}
				currentFilter={activeFilter}
				onApplyFilter={(f) => {
					setActiveFilter(f);
					setCurrentPage(1);
				}}
				onResetFilter={() => {
					setActiveFilter(null);
					setCurrentPage(1);
				}}
			/>

			{/* Nested Stacked Overlay Modals for Related Records */}
			<RelatedRecordModal
				modalStack={modalStack}
				onCloseTop={handleCloseTopModal}
				onCloseAll={handleCloseAllModals}
				onOpenRelated={handleOpenRelated}
			/>
		</div>
	);
}
