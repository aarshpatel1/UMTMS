import express from "express";
import publicTransitRoutes from "./publicTransitRoutes.js";
import railTrackRoutes from "./railTrackRoutes.js";
import trainRoutes from "./trainRoutes.js";
import busRoutes from "./busRoutes.js";
import transitScheduleRoutes from "./transitScheduleRoutes.js";
import passengerRoutes from "./passengerRoutes.js";
import trafficAuthorityRoutes from "./trafficAuthorityRoutes.js";
import trafficViolationRoutes from "./trafficViolationRoutes.js";
import trafficSignalRoutes from "./trafficSignalRoutes.js";
import cityPlannerRoutes from "./cityPlannerRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";
import commitsRoutes from "./commitsRoutes.js";
import monitoredInRoutes from "./monitoredInRoutes.js";
import historicalTrafficDataRoutes from "./historicalTrafficDataRoutes.js";
import locationRoutes from "./locationRoutes.js";
import emergencyVehicleRoutes from "./emergencyVehicleRoutes.js";
import emergencyResponseRoutes from "./emergencyResponseRoutes.js";
import intersectionRoutes from "./intersectionRoutes.js";
import roadRoutes from "./roadRoutes.js";
import trafficCameraRoutes from "./trafficCameraRoutes.js";
import roadSensorRoutes from "./roadSensorRoutes.js";
import trafficMonitoringRecordRoutes from "./trafficMonitoringRecordRoutes.js";
import batchRoutes from "./batchRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
	return res.status(200).json({
		message: "UMTMS API is running..!!",
		endpoints: [
			"/dashboard/summary",
			"/public-transits",
			"/rail-tracks",
			"/trains",
			"/buses",
			"/transit-schedules",
			"/passengers",
			"/traffic-authorities",
			"/traffic-violations",
			"/traffic-signals",
			"/city-planners",
			"/vehicles",
			"/commits",
			"/monitored-in",
			"/historical-traffic-data",
			"/locations",
			"/emergency-vehicles",
			"/emergency-responses",
			"/intersections",
			"/roads",
			"/traffic-cameras",
			"/road-sensors",
			"/traffic-monitoring-records",
		],
	});
});

// Dashboard Summary
router.use("/dashboard", dashboardRoutes);

// Transit & Passenger
router.use("/public-transits", publicTransitRoutes);
router.use("/public-transit", publicTransitRoutes);
router.use("/rail-tracks", railTrackRoutes);
router.use("/rail-track", railTrackRoutes);
router.use("/trains", trainRoutes);
router.use("/train", trainRoutes);
router.use("/buses", busRoutes);
router.use("/bus", busRoutes);
router.use("/transit-schedules", transitScheduleRoutes);
router.use("/transit-schedule", transitScheduleRoutes);
router.use("/passengers", passengerRoutes);
router.use("/passenger", passengerRoutes);

// Traffic Authority, Violations & Signals
router.use("/traffic-authorities", trafficAuthorityRoutes);
router.use("/traffic-authority", trafficAuthorityRoutes);
router.use("/traffic-violations", trafficViolationRoutes);
router.use("/traffic-violation", trafficViolationRoutes);
router.use("/traffic-signals", trafficSignalRoutes);
router.use("/traffic-signal", trafficSignalRoutes);

// City Planners & Vehicles
router.use("/city-planners", cityPlannerRoutes);
router.use("/city-planner", cityPlannerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/vehicle", vehicleRoutes);

// Junction Tables
router.use("/commits", commitsRoutes);
router.use("/monitored-in", monitoredInRoutes);

// Historical Traffic & Location
router.use("/historical-traffic-data", historicalTrafficDataRoutes);
router.use("/locations", locationRoutes);
router.use("/location", locationRoutes);

// Emergency Services
router.use("/emergency-vehicles", emergencyVehicleRoutes);
router.use("/emergency-vehicle", emergencyVehicleRoutes);
router.use("/emergency-responses", emergencyResponseRoutes);
router.use("/emergency-response", emergencyResponseRoutes);

// Infrastructure & Monitoring
router.use("/intersections", intersectionRoutes);
router.use("/intersection", intersectionRoutes);
router.use("/roads", roadRoutes);
router.use("/road", roadRoutes);
router.use("/traffic-cameras", trafficCameraRoutes);
router.use("/traffic-camera", trafficCameraRoutes);
router.use("/road-sensors", roadSensorRoutes);
router.use("/road-sensor", roadSensorRoutes);
router.use("/traffic-monitoring-records", trafficMonitoringRecordRoutes);
router.use("/traffic-monitoring-record", trafficMonitoringRecordRoutes);

// Universal Batch Delete and Bulk Operations
router.use("/", batchRoutes);

export default router;
