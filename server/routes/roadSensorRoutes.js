import express from "express";
import {
	getAllRoadSensors,
	getRoadSensorById,
	createRoadSensor,
	updateRoadSensor,
	deleteRoadSensor,
} from "../controller/roadSensorController.js";

const router = express.Router();

router.get("/", getAllRoadSensors);
router.get("/all-road-sensors", getAllRoadSensors);
router.get("/:id", getRoadSensorById);
router.post("/", createRoadSensor);
router.put("/:id", updateRoadSensor);
router.delete("/:id", deleteRoadSensor);

export default router;
