import db from "../db/db.js";
import { handleControllerError } from "../utils/validationHelper.js";

export const getDashboardSummary = async (req, res) => {
	try {
		const tablesMeta = [
			{ key: "public-transits", table: "umtms.public_transit", label: "Public Transits", category: "Transit & Passenger", icon: "bi-train-front", path: "/public-transits" },
			{ key: "rail-tracks", table: "umtms.rail_track", label: "Rail Tracks", category: "Transit & Passenger", icon: "bi-signpost-split", path: "/rail-tracks" },
			{ key: "trains", table: "umtms.train", label: "Trains", category: "Transit & Passenger", icon: "bi-train-lightrail-front", path: "/trains" },
			{ key: "buses", table: "umtms.bus", label: "Buses", category: "Transit & Passenger", icon: "bi-bus-front", path: "/buses" },
			{ key: "transit-schedules", table: "umtms.transit_schedule", label: "Transit Schedules", category: "Transit & Passenger", icon: "bi-calendar3", path: "/transit-schedules" },
			{ key: "passengers", table: "umtms.passenger", label: "Passengers", category: "Transit & Passenger", icon: "bi-people", path: "/passengers" },
			{ key: "traffic-authorities", table: "umtms.traffic_authority", label: "Traffic Authorities", category: "Traffic & Enforcement", icon: "bi-shield-check", path: "/traffic-authorities" },
			{ key: "traffic-violations", table: "umtms.traffic_violation", label: "Traffic Violations", category: "Traffic & Enforcement", icon: "bi-exclamation-triangle", path: "/traffic-violations" },
			{ key: "traffic-signals", table: "umtms.traffic_signal", label: "Traffic Signals", category: "Traffic & Enforcement", icon: "bi-traffic-light", path: "/traffic-signals" },
			{ key: "commits", table: "umtms.commits", label: "Commits (Violations)", category: "Traffic & Enforcement", icon: "bi-journal-check", path: "/commits" },
			{ key: "monitored-in", table: "umtms.monitored_in", label: "Monitored In", category: "Traffic & Enforcement", icon: "bi-eye", path: "/monitored-in" },
			{ key: "vehicles", table: "umtms.vehicle", label: "Vehicles", category: "Vehicles & Emergency", icon: "bi-car-front", path: "/vehicles" },
			{ key: "emergency-vehicles", table: "umtms.emergency_vehicle", label: "Emergency Vehicles", category: "Vehicles & Emergency", icon: "bi-truck", path: "/emergency-vehicles" },
			{ key: "emergency-responses", table: "umtms.emergency_response", label: "Emergency Responses", category: "Vehicles & Emergency", icon: "bi-activity", path: "/emergency-responses" },
			{ key: "roads", table: "umtms.road", label: "Roads", category: "Infrastructure & Sensors", icon: "bi-signpost-2", path: "/roads" },
			{ key: "intersections", table: "umtms.intersection", label: "Intersections", category: "Infrastructure & Sensors", icon: "bi-diagram-3", path: "/intersections" },
			{ key: "traffic-cameras", table: "umtms.traffic_camera", label: "Traffic Cameras", category: "Infrastructure & Sensors", icon: "bi-camera-video", path: "/traffic-cameras" },
			{ key: "road-sensors", table: "umtms.road_sensor", label: "Road Sensors", category: "Infrastructure & Sensors", icon: "bi-broadcast-pin", path: "/road-sensors" },
			{ key: "traffic-monitoring-records", table: "umtms.traffic_monitoring_record", label: "Monitoring Records", category: "Infrastructure & Sensors", icon: "bi-speedometer2", path: "/traffic-monitoring-records" },
			{ key: "historical-traffic-data", table: "umtms.historical_traffic_data", label: "Historical Data", category: "Infrastructure & Sensors", icon: "bi-graph-up", path: "/historical-traffic-data" },
			{ key: "locations", table: "umtms.location", label: "Locations", category: "Infrastructure & Sensors", icon: "bi-geo-alt", path: "/locations" },
			{ key: "city-planners", table: "umtms.city_planner", label: "City Planners", category: "Infrastructure & Sensors", icon: "bi-person-badge", path: "/city-planners" },
		];

		const [
			countsResults,
			vehiclesByTypeRes,
			violationsByTypeRes,
			violationsByStatusRes,
			signalsStatusRes,
			camerasStatusRes,
			sensorsStatusRes,
			emergencyStatusRes,
			emergencyResponsesRes,
			monitoringStatsRes,
			roadTypesRes,
			patternsRes,
			transitStatsRes,
			topViolationsRes,
			topMonitoringRes,
			topEmergenciesRes,
			topTransitRes,
			monitoringTimelineRes
		] = await Promise.all([
			// 1. Table counts
			Promise.all(tablesMeta.map(async (t) => {
				const res = await db.query(`SELECT count(*)::int as count FROM ${t.table}`);
				return { ...t, count: res.rows[0].count };
			})),
			// 2. Vehicles
			db.query(`SELECT vehicle_type, count(*)::int as count FROM umtms.vehicle GROUP BY vehicle_type ORDER BY count DESC`),
			// 3. Violations by type
			db.query(`SELECT violation_type, count(*)::int as count, sum(fine_amount)::numeric(12,2) as total_fines, round(avg(fine_amount)::numeric, 2) as avg_fine FROM umtms.traffic_violation GROUP BY violation_type ORDER BY count DESC`),
			// 4. Violations by status
			db.query(`SELECT fine_status, count(*)::int as count, sum(fine_amount)::numeric(12,2) as total_fines FROM umtms.traffic_violation GROUP BY fine_status ORDER BY fine_status ASC`),
			// 5. Signals status
			db.query(`SELECT status, count(*)::int as count FROM umtms.traffic_signal GROUP BY status ORDER BY status ASC`),
			// 6. Cameras status
			db.query(`SELECT status, camera_type, count(*)::int as count FROM umtms.traffic_camera GROUP BY status, camera_type ORDER BY status ASC`),
			// 7. Sensors status
			db.query(`SELECT status, sensor_type, count(*)::int as count FROM umtms.road_sensor GROUP BY status, sensor_type ORDER BY status ASC`),
			// 8. Emergency vehicles status
			db.query(`SELECT vehicle_type, status, count(*)::int as count FROM umtms.emergency_vehicle GROUP BY vehicle_type, status ORDER BY vehicle_type ASC`),
			// 9. Emergency responses
			db.query(`SELECT response_status, count(*)::int as count FROM umtms.emergency_response GROUP BY response_status ORDER BY response_status ASC`),
			// 10. Monitoring stats
			db.query(`SELECT count(*)::int as total_records, round(avg(vehicle_speed), 1) as avg_speed, max(vehicle_speed) as max_speed, round(avg(traffic_volume), 1) as avg_volume, sum(traffic_volume)::int as total_volume FROM umtms.traffic_monitoring_record`),
			// 11. Road types
			db.query(`SELECT road_type, count(*)::int as count FROM umtms.road GROUP BY road_type ORDER BY count DESC`),
			// 12. Traffic patterns
			db.query(`SELECT traffic_pattern, count(*)::int as count FROM umtms.historical_traffic_data GROUP BY traffic_pattern ORDER BY count DESC`),
			// 13. Transit stats
			db.query(`
				SELECT 
					(SELECT count(*)::int FROM umtms.bus) as total_buses,
					(SELECT coalesce(sum(capacity), 0)::int FROM umtms.bus) as bus_capacity,
					(SELECT count(*)::int FROM umtms.train) as total_trains,
					(SELECT coalesce(sum(capacity), 0)::int FROM umtms.train) as train_capacity,
					(SELECT count(*)::int FROM umtms.transit_schedule) as total_schedules,
					(SELECT count(*)::int FROM umtms.rail_track WHERE availability = true) as available_tracks,
					(SELECT coalesce(sum(passenger_count), 0)::int FROM umtms.passenger) as total_passengers
			`),
			// 14. Top violations (joined with vehicle and authority)
			db.query(`
				SELECT v.violation_id, v.violation_type, v.fine_amount, v.fine_status, 
							 v.violation_date, v.violation_time,
							 veh.registration_number, veh.vehicle_type,
							 ta.name as authority_name
				FROM umtms.traffic_violation v
				LEFT JOIN umtms.commits c ON v.violation_id = c.violation_id
				LEFT JOIN umtms.vehicle veh ON c.vehicle_id = veh.vehicle_id
				LEFT JOIN umtms.traffic_authority ta ON v.authority_id = ta.authority_id
				ORDER BY v.fine_amount DESC, v.violation_id ASC
				LIMIT 8
			`),
			// 15. Top monitoring (joined with road, sensor, camera)
			db.query(`
				SELECT tm.record_id, tm.vehicle_speed, tm.traffic_volume, tm.timestamp,
							 r.road_name, r.road_type,
							 s.sensor_type, c.camera_type
				FROM umtms.traffic_monitoring_record tm
				LEFT JOIN umtms.road r ON tm.road_id = r.road_id
				LEFT JOIN umtms.road_sensor s ON tm.sensor_id = s.sensor_id
				LEFT JOIN umtms.traffic_camera c ON tm.camera_id = c.camera_id
				ORDER BY tm.traffic_volume DESC, tm.vehicle_speed DESC
				LIMIT 8
			`),
			// 16. Active emergencies
			db.query(`
				SELECT er.response_id, er.response_status, er.emergency_id,
							 ev.vehicle_type, ev.status as vehicle_status,
							 loc.latitude, loc.longitude
				FROM umtms.emergency_response er
				LEFT JOIN umtms.emergency_vehicle ev ON er.emergency_id = ev.emergency_vehicle_id
				LEFT JOIN umtms.location loc ON ev.location_id = loc.location_id
				ORDER BY CASE er.response_status 
					WHEN 'OPEN' THEN 1 
					WHEN 'IN_PROGRESS' THEN 2 
					WHEN 'COMPLETED' THEN 3 
					ELSE 4 END, er.response_id ASC
				LIMIT 8
			`),
			// 17. Top transit schedules / routes
			db.query(`
				SELECT b.bus_id as transit_unit_id, b.route_number as identifier, b.capacity, 'Bus' as type,
							 s.departure_time, s.arrival_time
				FROM umtms.bus b
				LEFT JOIN umtms.transit_schedule s ON b.bus_id = s.bus_id
				ORDER BY b.capacity DESC
				LIMIT 5
			`),
			// 18. Monitoring timeline sample (sorted chronologically for trend chart)
			db.query(`
				SELECT record_id, timestamp, vehicle_speed, traffic_volume
				FROM umtms.traffic_monitoring_record
				ORDER BY timestamp ASC, record_id ASC
				LIMIT 20
			`)
		]);

		const totalDatabaseRecords = countsResults.reduce((acc, curr) => acc + curr.count, 0);

		// Calculate fine KPI totals
		const violationsFineTotals = violationsByStatusRes.rows.reduce(
			(acc, r) => {
				const val = parseFloat(r.total_fines || 0);
				const count = parseInt(r.count || 0, 10);
				acc.totalAmount += val;
				acc.totalCount += count;
				if (r.fine_status === "PAID") {
					acc.paidAmount += val;
					acc.paidCount += count;
				} else if (r.fine_status === "PENDING") {
					acc.pendingAmount += val;
					acc.pendingCount += count;
				} else {
					acc.unpaidAmount += val;
					acc.unpaidCount += count;
				}
				return acc;
			},
			{ totalAmount: 0, totalCount: 0, paidAmount: 0, paidCount: 0, pendingAmount: 0, pendingCount: 0, unpaidAmount: 0, unpaidCount: 0 }
		);

		const recoveryRate = violationsFineTotals.totalAmount > 0
			? ((violationsFineTotals.paidAmount / violationsFineTotals.totalAmount) * 100).toFixed(1)
			: 0;

		// Hardware status summary (Signals + Cameras + Sensors)
		const hardwareBreakdown = {
			signals: signalsStatusRes.rows,
			cameras: camerasStatusRes.rows,
			sensors: sensorsStatusRes.rows,
		};

		const activeSignals = signalsStatusRes.rows.find((s) => s.status === "ACTIVE")?.count || 0;
		const totalSignals = signalsStatusRes.rows.reduce((acc, s) => acc + s.count, 0);

		const activeCameras = camerasStatusRes.rows.filter((c) => c.status === "ACTIVE").reduce((acc, c) => acc + c.count, 0);
		const totalCameras = camerasStatusRes.rows.reduce((acc, c) => acc + c.count, 0);

		const activeSensors = sensorsStatusRes.rows.filter((s) => s.status === "ACTIVE").reduce((acc, s) => acc + s.count, 0);
		const totalSensors = sensorsStatusRes.rows.reduce((acc, s) => acc + s.count, 0);

		const totalHardware = totalSignals + totalCameras + totalSensors;
		const totalActiveHardware = activeSignals + activeCameras + activeSensors;
		const hardwareHealthRate = totalHardware > 0 ? ((totalActiveHardware / totalHardware) * 100).toFixed(1) : 0;

		// Emergency Fleet Readiness
		const emergencyStatusMap = emergencyStatusRes.rows.reduce((acc, r) => {
			acc[r.status] = (acc[r.status] || 0) + r.count;
			return acc;
		}, {});
		const totalEmergencyVehicles = Object.values(emergencyStatusMap).reduce((a, b) => a + b, 0);
		const availableEmergencyVehicles = (emergencyStatusMap["AVAILABLE"] || 0) + (emergencyStatusMap["DISPATCHED"] || 0);
		const emergencyReadinessRate = totalEmergencyVehicles > 0 ? ((availableEmergencyVehicles / totalEmergencyVehicles) * 100).toFixed(1) : 0;

		const response = {
			success: true,
			timestamp: new Date().toISOString(),
			totalDatabaseRecords,
			kpis: {
				totalRecords: totalDatabaseRecords,
				totalVehicles: countsResults.find((c) => c.key === "vehicles")?.count || 0,
				violations: {
					totalCount: violationsFineTotals.totalCount,
					totalAmount: violationsFineTotals.totalAmount,
					paidAmount: violationsFineTotals.paidAmount,
					pendingAmount: violationsFineTotals.pendingAmount,
					unpaidAmount: violationsFineTotals.unpaidAmount,
					recoveryRate,
				},
				infrastructure: {
					totalSignals,
					activeSignals,
					totalCameras,
					activeCameras,
					totalSensors,
					activeSensors,
					totalHardware,
					totalActiveHardware,
					hardwareHealthRate,
					totalRoads: countsResults.find((c) => c.key === "roads")?.count || 0,
					totalIntersections: countsResults.find((c) => c.key === "intersections")?.count || 0,
				},
				emergency: {
					totalVehicles: totalEmergencyVehicles,
					statusBreakdown: emergencyStatusMap,
					readinessRate: emergencyReadinessRate,
					responsesBreakdown: emergencyResponsesRes.rows,
					activeResponsesCount: emergencyResponsesRes.rows
						.filter((r) => r.response_status === "OPEN" || r.response_status === "IN_PROGRESS")
						.reduce((acc, r) => acc + r.count, 0),
				},
				transit: {
					...transitStatsRes.rows[0],
					totalFleetCapacity: (parseInt(transitStatsRes.rows[0]?.bus_capacity || 0, 10) + parseInt(transitStatsRes.rows[0]?.train_capacity || 0, 10)),
				},
				monitoring: monitoringStatsRes.rows[0] || {},
			},
			charts: {
				violationsByType: violationsByTypeRes.rows,
				violationsByStatus: violationsByStatusRes.rows,
				vehiclesByType: vehiclesByTypeRes.rows,
				roadTypes: roadTypesRes.rows,
				trafficPatterns: patternsRes.rows,
				hardwareBreakdown,
				emergencyVehicles: emergencyStatusRes.rows,
				emergencyResponses: emergencyResponsesRes.rows,
				monitoringTimeline: monitoringTimelineRes.rows,
			},
			topRecords: {
				violations: topViolationsRes.rows,
				monitoring: topMonitoringRes.rows,
				emergencies: topEmergenciesRes.rows,
				transit: topTransitRes.rows,
			},
			tablesSummary: countsResults,
		};

		return res.status(200).json(response);
	} catch (error) {
		return handleControllerError(res, error);
	}
};
