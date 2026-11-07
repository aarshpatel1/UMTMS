import express from "express";
import {
	getAllTrafficSignals,
	getTrafficSignalById,
	createTrafficSignal,
	updateTrafficSignal,
	deleteTrafficSignal,
} from "../controller/trafficSignalController.js";

const router = express.Router();

router.get("/", getAllTrafficSignals);
router.get("/all-traffic-signals", getAllTrafficSignals);
router.get("/:id", getTrafficSignalById);
router.post("/", createTrafficSignal);
router.put("/:id", updateTrafficSignal);
router.delete("/:id", deleteTrafficSignal);

export default router;
