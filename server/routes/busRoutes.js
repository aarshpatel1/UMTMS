import express from "express";
import {
	getAllBuses,
	getBusById,
	createBus,
	updateBus,
	deleteBus,
} from "../controller/busController.js";

const router = express.Router();

router.get("/", getAllBuses);
router.get("/all-buses", getAllBuses);
router.get("/:id", getBusById);
router.post("/", createBus);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);

export default router;
