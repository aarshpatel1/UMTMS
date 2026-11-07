import express from "express";
import {
	getAllHistoricalTrafficData,
	getHistoricalTrafficDataById,
	createHistoricalTrafficData,
	updateHistoricalTrafficData,
	deleteHistoricalTrafficData,
} from "../controller/historicalTrafficDataController.js";

const router = express.Router();

router.get("/", getAllHistoricalTrafficData);
router.get("/all-historical-traffic-data", getAllHistoricalTrafficData);
router.get("/:id", getHistoricalTrafficDataById);
router.post("/", createHistoricalTrafficData);
router.put("/:id", updateHistoricalTrafficData);
router.delete("/:id", deleteHistoricalTrafficData);

export default router;
