import express from "express";
import {
	getAllEmergencyResponses,
	getEmergencyResponseById,
	createEmergencyResponse,
	updateEmergencyResponse,
	deleteEmergencyResponse,
} from "../controller/emergencyResponseController.js";

const router = express.Router();

router.get("/", getAllEmergencyResponses);
router.get("/all-emergency-responses", getAllEmergencyResponses);
router.get("/:id", getEmergencyResponseById);
router.post("/", createEmergencyResponse);
router.put("/:id", updateEmergencyResponse);
router.delete("/:id", deleteEmergencyResponse);

export default router;
