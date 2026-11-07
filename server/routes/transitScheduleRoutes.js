import express from "express";
import {
	getAllTransitSchedules,
	getTransitScheduleById,
	createTransitSchedule,
	updateTransitSchedule,
	deleteTransitSchedule,
} from "../controller/transitScheduleController.js";

const router = express.Router();

router.get("/", getAllTransitSchedules);
router.get("/all-transit-schedules", getAllTransitSchedules);
router.get("/:id", getTransitScheduleById);
router.post("/", createTransitSchedule);
router.put("/:id", updateTransitSchedule);
router.delete("/:id", deleteTransitSchedule);

export default router;
