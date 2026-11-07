import express from "express";
import {
	getAllMonitoredIn,
	getMonitoredInByIds,
	createMonitoredIn,
	deleteMonitoredIn,
} from "../controller/monitoredInController.js";

const router = express.Router();

router.get("/", getAllMonitoredIn);
router.get("/all-monitored-in", getAllMonitoredIn);
router.get("/:vehicle_id/:signal_id/:violation_id", getMonitoredInByIds);
router.post("/", createMonitoredIn);
router.delete("/:vehicle_id/:signal_id/:violation_id", deleteMonitoredIn);

export default router;
