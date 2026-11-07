import express from "express";
import {
	getAllLocations,
	getLocationById,
	createLocation,
	updateLocation,
	deleteLocation,
} from "../controller/locationController.js";

const router = express.Router();

router.get("/", getAllLocations);
router.get("/all-locations", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
