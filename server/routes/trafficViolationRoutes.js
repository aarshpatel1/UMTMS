import express from "express";
import {
	getAllTrafficViolations,
	getTrafficViolationById,
	createTrafficViolation,
	updateTrafficViolation,
	deleteTrafficViolation,
} from "../controller/trafficViolationController.js";

const router = express.Router();

router.get("/", getAllTrafficViolations);
router.get("/all-traffic-violations", getAllTrafficViolations);
router.get("/:id", getTrafficViolationById);
router.post("/", createTrafficViolation);
router.put("/:id", updateTrafficViolation);
router.delete("/:id", deleteTrafficViolation);

export default router;
