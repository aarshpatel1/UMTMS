import express from "express";
import {
	getAllRoads,
	getRoadById,
	createRoad,
	updateRoad,
	deleteRoad,
} from "../controller/roadController.js";

const router = express.Router();

router.get("/", getAllRoads);
router.get("/all-roads", getAllRoads);
router.get("/:id", getRoadById);
router.post("/", createRoad);
router.put("/:id", updateRoad);
router.delete("/:id", deleteRoad);

export default router;
