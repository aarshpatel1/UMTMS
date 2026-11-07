import express from "express";
import {
	getAllMonitoredIn,
	getMonitoredInByIds,
	createMonitoredIn,
	updateMonitoredIn,
	deleteMonitoredIn,
} from "../controller/monitoredInController.js";

const router = express.Router();

router.get("/", getAllMonitoredIn);
router.get("/all-monitored-in", getAllMonitoredIn);
router.get("/:vehicle_id/:signal_id/:violation_id", getMonitoredInByIds);
router.get("/:id", (req, res) => {
	const parts = req.params.id.split("-");
	req.params.vehicle_id = parts[0];
	req.params.signal_id = parts[1];
	req.params.violation_id = parts[2];
	return getMonitoredInByIds(req, res);
});
router.post("/", createMonitoredIn);
router.put("/:vehicle_id/:signal_id/:violation_id", updateMonitoredIn);
router.put("/:id", updateMonitoredIn);
router.delete("/:vehicle_id/:signal_id/:violation_id", deleteMonitoredIn);
router.delete("/:id", deleteMonitoredIn);

export default router;
