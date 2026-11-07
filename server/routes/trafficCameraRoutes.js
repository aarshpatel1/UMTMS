import express from "express";
import {
	getAllTrafficCameras,
	getTrafficCameraById,
	createTrafficCamera,
	updateTrafficCamera,
	deleteTrafficCamera,
} from "../controller/trafficCameraController.js";

const router = express.Router();

router.get("/", getAllTrafficCameras);
router.get("/all-traffic-cameras", getAllTrafficCameras);
router.get("/:id", getTrafficCameraById);
router.post("/", createTrafficCamera);
router.put("/:id", updateTrafficCamera);
router.delete("/:id", deleteTrafficCamera);

export default router;
