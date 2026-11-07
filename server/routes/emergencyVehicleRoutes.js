import express from "express";
import {
	getAllEmergencyVehicles,
	getEmergencyVehicleById,
	createEmergencyVehicle,
	updateEmergencyVehicle,
	deleteEmergencyVehicle,
} from "../controller/emergencyVehicleController.js";

const router = express.Router();

router.get("/", getAllEmergencyVehicles);
router.get("/all-emergency-vehicles", getAllEmergencyVehicles);
router.get("/:id", getEmergencyVehicleById);
router.post("/", createEmergencyVehicle);
router.put("/:id", updateEmergencyVehicle);
router.delete("/:id", deleteEmergencyVehicle);

export default router;
