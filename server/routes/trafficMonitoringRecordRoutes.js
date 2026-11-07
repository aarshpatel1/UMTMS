import express from "express";
import {
	getAllTrafficMonitoringRecords,
	getTrafficMonitoringRecordById,
	createTrafficMonitoringRecord,
	updateTrafficMonitoringRecord,
	deleteTrafficMonitoringRecord,
} from "../controller/trafficMonitoringRecordController.js";

const router = express.Router();

router.get("/", getAllTrafficMonitoringRecords);
router.get("/all-traffic-monitoring-records", getAllTrafficMonitoringRecords);
router.get("/:id", getTrafficMonitoringRecordById);
router.post("/", createTrafficMonitoringRecord);
router.put("/:id", updateTrafficMonitoringRecord);
router.delete("/:id", deleteTrafficMonitoringRecord);

export default router;
