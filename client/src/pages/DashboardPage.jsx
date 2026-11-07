import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardSummary } from "../api/apiClient";
import { NAV_GROUPS } from "../config/routesConfig";
import StatCard from "../components/dashboard/StatCard";
import DonutChart from "../components/dashboard/DonutChart";
import BarChart from "../components/dashboard/BarChart";
import HorizontalBarChart from "../components/dashboard/HorizontalBarChart";
import AreaTrendChart from "../components/dashboard/AreaTrendChart";
import TopRecordsSection from "../components/dashboard/TopRecordsSection";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import "../styles/dashboard.css";

export default function DashboardPage() {
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [isFallback, setIsFallback] = useState(false);
	const [selectedDomain, setSelectedDomain] = useState("all");
	const [lastRefreshed, setLastRefreshed] = useState(
		new Date().toLocaleTimeString(),
	);

	const loadData = async (isManual = false) => {
		if (isManual) setRefreshing(true);
		else setLoading(true);

		try {
			const res = await fetchDashboardSummary();
			setSummary(res.data);
			setIsFallback(res.isFallback);
			setLastRefreshed(new Date().toLocaleTimeString());
		} catch (err) {
			console.error("Error loading dashboard summary:", err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	if (loading && !summary) {
		return <LoadingSkeleton />;
	}

	const kpis = summary?.kpis || {};
	const charts = summary?.charts || {};
	const topRecords = summary?.topRecords || {};
	const tablesSummary = summary?.tablesSummary || [];

	// Formatting chart data
	// 1. Violations by Type Bar Chart
	const violationsByTypeChartData = (charts.violationsByType || []).map(
		(v) => ({
			label: String(v.violation_type).replace(/_/g, " "),
			value: Number(v.count),
			color: "#7f56d9",
			subtext: `Total fines: ₹${Number(v.total_fines || 0).toLocaleString()} (avg ₹${Number(v.avg_fine || 0).toLocaleString()})`,
		}),
	);

	// 2. Fines by Status Donut Chart
	const finesByStatusChartData = (charts.violationsByStatus || []).map((f) => {
		let color = "#027a48";
		if (f.fine_status === "PENDING") color = "#f79009";
		if (f.fine_status === "UNPAID") color = "#d92d20";
		return {
			label: f.fine_status,
			value: Number(f.count),
			color,
			subtext: `₹${Number(f.total_fines || 0).toLocaleString()}`,
		};
	});

	// 3. Vehicles by Type Horizontal Bar Chart
	const vehicleIcons = {
		CAR: "bi-car-front",
		TRUCK: "bi-truck",
		BUS: "bi-bus-front",
		VAN: "bi-truck-flatbed",
		MOTORCYCLE: "bi-bicycle",
	};
	const vehiclesByTypeChartData = (charts.vehiclesByType || []).map((v) => ({
		label: v.vehicle_type,
		value: Number(v.count),
		icon: vehicleIcons[v.vehicle_type] || "bi-car-front",
		color: "#175cd3",
	}));

	// 4. Infrastructure Status Donut Chart (Signals + Cameras + Sensors)
	const totalHardware = kpis.infrastructure?.totalHardware || 300;
	const activeHardware = kpis.infrastructure?.totalActiveHardware || 102;
	const inactiveHardware = totalHardware - activeHardware;
	const hardwareHealthChartData = [
		{ label: "Active Operational", value: activeHardware, color: "#12b76a" },
		{
			label: "Maintenance / Inactive",
			value: inactiveHardware,
			color: "#f79009",
		},
	];

	// 5. Road Types Horizontal Bar Chart
	const roadTypesChartData = (charts.roadTypes || []).map((r) => ({
		label: r.road_type,
		value: Number(r.count),
		icon: "bi-signpost-2",
		color: "#475467",
	}));

	// 6. Traffic Patterns Bar Chart
	const patternColors = {
		LOW: "#12b76a",
		MODERATE: "#175cd3",
		HEAVY: "#f79009",
		CONGESTED: "#d92d20",
	};
	const trafficPatternsChartData = (charts.trafficPatterns || []).map((p) => ({
		label: p.traffic_pattern,
		value: Number(p.count),
		color: patternColors[p.traffic_pattern] || "#7f56d9",
	}));

	// 7. Emergency Readiness Donut Chart
	const emergencyStatusMap = kpis.emergency?.statusBreakdown || {};
	const emergencyChartData = [
		{
			label: "Available",
			value: emergencyStatusMap.AVAILABLE || 25,
			color: "#12b76a",
		},
		{
			label: "Dispatched",
			value: emergencyStatusMap.DISPATCHED || 25,
			color: "#175cd3",
		},
		{
			label: "Busy Incident",
			value: emergencyStatusMap.BUSY || 25,
			color: "#f79009",
		},
		{
			label: "Maintenance",
			value: emergencyStatusMap.MAINTENANCE || 25,
			color: "#98a2b3",
		},
	];

	return (
		<div className="dashboard-container pb-5">
			{/* Breadcrumbs Bar */}
			<div className="breadcrumbs-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
				<div className="d-flex align-items-center gap-2">
					{/* <span className="breadcrumb-logo-badge">
            <i className="bi bi-grid text-white" style={{ fontSize: '0.65rem' }}></i>
          </span> */}
					<span>UMTMS</span>
					<span className="breadcrumb-separator">›</span>
					<span className="breadcrumb-current">
						Database Executive Dashboard
					</span>
				</div>

				<div className="d-flex align-items-center gap-2">
					{/* Live indicator badge */}
					<span className="d-inline-flex align-items-center gap-2 px-2.5 py-1 rounded-pill bg-white border small shadow-xs">
						<span
							className={`ms-2 pulsing-beacon ${isFallback ? "offline" : "online"}`}
						></span>
						<span
							className="fw-medium text-secondary me-2"
							style={{ fontSize: "0.78rem" }}
						>
							{isFallback
								? "Offline Mode (Preview Data)"
								: "Live PostgreSQL Database"}
						</span>
					</span>

					<button
						type="button"
						className="btn btn-sm btn-white border shadow-xs d-inline-flex align-items-center gap-1.5"
						onClick={() => loadData(true)}
						disabled={refreshing}
						title="Refresh database summary"
					>
						<i
							className={`bi bi-arrow-clockwise ${refreshing ? "spin" : ""}`}
						></i>
						<span className="d-none d-sm-inline">Refresh</span>
					</button>
				</div>
			</div>

			{/* Main Header & Subtitle */}
			<div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
				<div>
					<h1 className="page-title mb-1">Database Executive Dashboard</h1>
					<p className="text-muted small mb-0">
						Real-time multi-modal mobility intelligence across transit networks,
						enforcement, sensors & emergency services.
					</p>
				</div>

				<div className="d-flex align-items-center gap-2">
					<span className="text-muted small" style={{ fontSize: "0.78rem" }}>
						Last sync: <strong className="text-dark">{lastRefreshed}</strong>
					</span>
				</div>
			</div>

			{/* Domain Sector Filter Pills */}
			<div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-1">
				{[
					{ id: "all", label: "All Domains", icon: "bi-grid" },
					{
						id: "violations",
						label: "Enforcement & Fines",
						icon: "bi-exclamation-triangle",
					},
					{ id: "transit", label: "Transit & Fleet", icon: "bi-bus-front" },
					{
						id: "infrastructure",
						label: "Infrastructure & Sensors",
						icon: "bi-broadcast-pin",
					},
					{ id: "emergency", label: "Emergency & Dispatch", icon: "bi-truck" },
				].map((tab) => (
					<button
						key={tab.id}
						type="button"
						className={`btn btn-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 fw-semibold ${
							selectedDomain === tab.id
								? "btn-dark text-white shadow-xs"
								: "btn-outline-secondary bg-white border"
						}`}
						style={{ fontSize: "0.82rem" }}
						onClick={() => setSelectedDomain(tab.id)}
					>
						<i className={`bi ${tab.icon} me-2`}></i>
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			{/* =========================================================================
          SECTION 1: HIGH-LEVEL NUMBER CARDS (KPIS)
          ========================================================================= */}
			<div className="row g-3 mb-4">
				{/* Card 1: Total Records */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Total Records"
						value={(summary?.totalDatabaseRecords || 2198).toLocaleString()}
						subvalue="Across 22 Database Tables"
						badgeText="Full DB"
						badgeVariant="purple"
						icon="bi-database"
						color="purple"
					/>
				</div>

				{/* Card 2: Violations & Fine Collections */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Total Violations"
						value={kpis.violations?.totalCount || 100}
						subvalue={`₹${(kpis.violations?.totalAmount || 0).toLocaleString()} Fines`}
						badgeText={`${kpis.violations?.recoveryRate || 0}% Paid`}
						badgeVariant="green"
						icon="bi-shield-exclamation"
						color="red"
					/>
				</div>

				{/* Card 3: Vehicles Fleet */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Registered Vehicles"
						value={kpis.totalVehicles || 100}
						subvalue="5 Vehicle Classifications"
						badgeText="Active"
						badgeVariant="blue"
						icon="bi-car-front"
						color="blue"
					/>
				</div>

				{/* Card 4: Hardware Infrastructure */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Hardware Health"
						value={`${kpis.infrastructure?.hardwareHealthRate || 34.0}%`}
						subvalue={`${kpis.infrastructure?.totalActiveHardware || 102}/${kpis.infrastructure?.totalHardware || 300} Active Units`}
						badgeText="Signals & Cams"
						badgeVariant="amber"
						icon="bi-broadcast"
						color="green"
					/>
				</div>

				{/* Card 5: Emergency Readiness */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Emergency Fleet"
						value={`${kpis.emergency?.readinessRate || 50.0}%`}
						subvalue={`${kpis.emergency?.totalVehicles || 100} Response Units`}
						badgeText="Readiness"
						badgeVariant="blue"
						icon="bi-hospital"
						color="amber"
					/>
				</div>

				{/* Card 6: Transit Capacity */}
				<div className="col-12 col-sm-6 col-xl-3">
					<StatCard
						title="Transit Capacity"
						value={(kpis.transit?.totalFleetCapacity || 40970).toLocaleString()}
						subvalue={`${kpis.transit?.total_buses || 100} Buses, ${kpis.transit?.total_trains || 100} Trains`}
						badgeText="Capacity"
						badgeVariant="purple"
						icon="bi-train-front"
						color="indigo"
					/>
				</div>
			</div>

			{/* =========================================================================
          SECTION 2: DATA VISUALIZATION & CHARTS
          ========================================================================= */}

			{/* Violations & Enforcement Charts */}
			{(selectedDomain === "all" || selectedDomain === "violations") && (
				<div className="row g-3 mb-4">
					<div className="col-12 col-lg-7">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-bar-chart text-primary"></i>
										Traffic Violations by Category & Penalties
									</h5>
									<p className="text-muted small mb-0">
										Distribution of infraction types and total fine impact in
										Indian Rupees (₹)
									</p>
								</div>
								<Link
									to="/traffic-violations"
									className="btn btn-sm btn-outline-secondary"
								>
									View Violations
								</Link>
							</div>
							<div className="chart-card-body">
								<BarChart
									data={violationsByTypeChartData}
									height={240}
									barColor="#7f56d9"
									valueSuffix=" cases"
								/>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-5">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-pie-chart text-success"></i>
										Fine Settlement Status
									</h5>
									<p className="text-muted small mb-0">
										Paid, pending & unpaid recovery
									</p>
								</div>
							</div>
							<div className="chart-card-body">
								<DonutChart
									data={finesByStatusChartData}
									totalLabel="Violations"
									size={190}
									strokeWidth={28}
								/>
								<div className="mt-3 pt-3 border-top d-flex justify-content-between text-center small text-muted">
									<div>
										<span className="d-block fw-bold text-success">
											₹
											{Number(
												kpis.violations?.paidAmount || 53750,
											).toLocaleString()}
										</span>
										<span>Paid</span>
									</div>
									<div>
										<span className="d-block fw-bold text-warning">
											₹
											{Number(
												kpis.violations?.pendingAmount || 54750,
											).toLocaleString()}
										</span>
										<span>Pending</span>
									</div>
									<div>
										<span className="d-block fw-bold text-danger">
											₹
											{Number(
												kpis.violations?.unpaidAmount || 54000,
											).toLocaleString()}
										</span>
										<span>Unpaid</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Fleet & Infrastructure Charts */}
			{(selectedDomain === "all" ||
				selectedDomain === "transit" ||
				selectedDomain === "infrastructure") && (
				<div className="row g-3 mb-4">
					<div className="col-12 col-lg-6">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-car-front text-primary"></i>
										Vehicle Fleet Classification
									</h5>
									<p className="text-muted small mb-0">
										Total 100 registered transit and personal transport vehicles
									</p>
								</div>
								<Link
									to="/vehicles"
									className="btn btn-sm btn-outline-secondary"
								>
									View Vehicles
								</Link>
							</div>
							<div className="chart-card-body">
								<HorizontalBarChart
									data={vehiclesByTypeChartData}
									color="#175cd3"
									valueSuffix=" units"
								/>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-6">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-broadcast text-success"></i>
										Infrastructure Network Health
									</h5>
									<p className="text-muted small mb-0">
										Combined operational uptime of Signals, Cameras & Road
										Sensors
									</p>
								</div>
								<Link
									to="/traffic-signals"
									className="btn btn-sm btn-outline-secondary"
								>
									Signals & Cams
								</Link>
							</div>
							<div className="chart-card-body">
								<DonutChart
									data={hardwareHealthChartData}
									totalLabel="Total Devices"
									centerValue={totalHardware}
									size={190}
									strokeWidth={28}
								/>
								<div className="row g-2 mt-3 pt-3 border-top text-center small">
									<div className="col-4">
										<span className="text-muted d-block">Signals</span>
										<strong className="text-dark">
											{kpis.infrastructure?.activeSignals || 34}/
											{kpis.infrastructure?.totalSignals || 100}
										</strong>
									</div>
									<div className="col-4">
										<span className="text-muted d-block">Cameras</span>
										<strong className="text-dark">
											{kpis.infrastructure?.activeCameras || 34}/
											{kpis.infrastructure?.totalCameras || 100}
										</strong>
									</div>
									<div className="col-4">
										<span className="text-muted d-block">Sensors</span>
										<strong className="text-dark">
											{kpis.infrastructure?.activeSensors || 34}/
											{kpis.infrastructure?.totalSensors || 100}
										</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Traffic Monitoring Timeline & Road Network */}
			{(selectedDomain === "all" || selectedDomain === "infrastructure") && (
				<div className="row g-3 mb-4">
					<div className="col-12 col-lg-8">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-speedometer2 text-primary"></i>
										Traffic Monitoring Telemetry Stream
									</h5>
									<p className="text-muted small mb-0">
										Correlation between recorded Traffic Volume (veh/hr) and
										Vehicle Speed (km/h)
									</p>
								</div>
								<Link
									to="/traffic-monitoring-records"
									className="btn btn-sm btn-outline-secondary"
								>
									Telemetry Feed
								</Link>
							</div>
							<div className="chart-card-body">
								<AreaTrendChart
									data={charts.monitoringTimeline || []}
									height={220}
								/>
								<div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top small text-muted">
									<span>
										Avg Speed:{" "}
										<strong className="text-dark">
											{kpis.monitoring?.avg_speed || 70.5} km/h
										</strong>
									</span>
									<span>
										Peak Speed:{" "}
										<strong className="text-dark">
											{kpis.monitoring?.max_speed || 120} km/h
										</strong>
									</span>
									<span>
										Avg Volume:{" "}
										<strong className="text-dark">
											{kpis.monitoring?.avg_volume || 100.5} veh/hr
										</strong>
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-4">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-diagram-2 text-primary"></i>
										Road Classification
									</h5>
									<p className="text-muted small mb-0">
										Arterial, highway & collector lanes
									</p>
								</div>
								<Link to="/roads" className="btn btn-sm btn-outline-secondary">
									Roads
								</Link>
							</div>
							<div className="chart-card-body">
								<HorizontalBarChart
									data={roadTypesChartData}
									color="#475467"
									valueSuffix=" roads"
								/>
								<div className="mt-3 pt-3 border-top">
									<h6 className="small fw-bold text-muted text-uppercase mb-2">
										Historical Patterns
									</h6>
									<BarChart
										data={trafficPatternsChartData}
										height={140}
										valueSuffix=""
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Emergency Readiness Section */}
			{(selectedDomain === "all" || selectedDomain === "emergency") && (
				<div className="row g-3 mb-4">
					<div className="col-12 col-lg-6">
						<div className="content-card h-100">
							<div className="chart-card-header">
								<div>
									<h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
										<i className="bi bi-hospital text-danger"></i>
										Emergency Vehicle Readiness
									</h5>
									<p className="text-muted small mb-0">
										Ambulances, Fire Engines, and Police Patrol units readiness
										state
									</p>
								</div>
								<Link
									to="/emergency-vehicles"
									className="btn btn-sm btn-outline-secondary"
								>
									Emergency Fleet
								</Link>
							</div>
							<div className="chart-card-body">
								<DonutChart
									data={emergencyChartData}
									totalLabel="Total Units"
									centerValue={kpis.emergency?.totalVehicles || 100}
									size={190}
									strokeWidth={28}
								/>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-6">
						<div className="content-card h-100 p-4 d-flex flex-column justify-content-between">
							<div>
								<h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
									<i className="bi bi-activity text-primary"></i>
									Emergency Incident Management
								</h5>
								<p className="text-muted small mb-3">
									Summary of current active dispatch cases and resolved response
									calls
								</p>

								<div className="row g-3">
									{(charts.emergencyResponses || []).map((resp, i) => {
										const badgeStyles = {
											OPEN: {
												border: "border-danger-subtle",
												text: "text-danger",
												bg: "bg-danger-subtle",
											},
											IN_PROGRESS: {
												border: "border-warning-subtle",
												text: "text-warning-emphasis",
												bg: "bg-warning-subtle",
											},
											COMPLETED: {
												border: "border-success-subtle",
												text: "text-success",
												bg: "bg-success-subtle",
											},
											CANCELLED: {
												border: "border-secondary-subtle",
												text: "text-secondary",
												bg: "bg-light",
											},
										};
										const style =
											badgeStyles[resp.response_status] ||
											badgeStyles.CANCELLED;
										return (
											<div key={i} className="col-6">
												<div
													className={`p-3 rounded-3 border ${style.border} ${style.bg}`}
												>
													<span className="small text-muted fw-semibold text-uppercase d-block mb-1">
														{resp.response_status.replace(/_/g, " ")}
													</span>
													<h3 className={`fw-bold mb-0 ${style.text}`}>
														{resp.count}
													</h3>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<div className="pt-3 border-top mt-3 d-flex align-items-center justify-content-between">
								<span className="small text-muted">
									Total Active Response Teams:{" "}
									<strong>{kpis.emergency?.activeResponsesCount || 50}</strong>
								</span>
								<Link to="/emergency-responses" className="btn btn-sm btn-dark">
									Manage Dispatches
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* =========================================================================
          SECTION 3: KEY DATABASE RECORDS & TOP ENTITIES
          ========================================================================= */}
			<TopRecordsSection
				topViolations={topRecords.violations || []}
				topMonitoring={topRecords.monitoring || []}
				topEmergencies={topRecords.emergencies || []}
				topTransit={topRecords.transit || []}
				tablesSummary={tablesSummary}
			/>

			{/* =========================================================================
          SECTION 4: COMPLETE SYSTEM DIRECTORY
          ========================================================================= */}
			<div className="content-card p-4">
				<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
					<h5 className="fw-semibold mb-0">
						System Directory & Entity Navigator
					</h5>
					<span className="badge bg-light text-muted border">
						22 Database Tables
					</span>
				</div>
				<div className="row g-3">
					{NAV_GROUPS.filter((g) => g.title !== "GENERAL").map((group, idx) => (
						<div key={idx} className="col-12 col-md-6 col-xl-3">
							<h6
								className="text-uppercase text-muted fw-bold small mb-2"
								style={{ fontSize: "0.75rem" }}
							>
								{group.title}
							</h6>
							<ul className="list-unstyled mb-0">
								{group.items.map((item, itemIdx) => {
									const matchTable = tablesSummary.find(
										(t) => t.path === item.path || t.key === item.entityKey,
									);
									return (
										<li key={itemIdx} className="my-2">
											<Link
												to={item.path}
												className="d-flex align-items-center justify-content-between p-1.5 px-2 rounded-2 text-decoration-none text-secondary hover-shadow bg-light-subtle"
											>
												<div className="d-flex align-items-center gap-2 text-truncate">
													<i className={`bi ${item.icon} text-primary`}></i>
													<span className="fw-medium text-dark small text-truncate">
														{item.label}
													</span>
												</div>
												{matchTable && (
													<span
														className="badge bg-white text-muted border px-1.5 py-0.5 small"
														style={{ fontSize: "0.68rem" }}
													>
														{matchTable.count}
													</span>
												)}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
