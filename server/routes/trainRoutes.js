import express from "express";
import {
	getAllTrains,
	getTrainById,
	createTrain,
	updateTrain,
	deleteTrain,
} from "../controller/trainController.js";

const router = express.Router();

router.get("/", getAllTrains);
router.get("/all-trains", getAllTrains);
router.get("/:id", getTrainById);
router.post("/", createTrain);
router.put("/:id", updateTrain);
router.delete("/:id", deleteTrain);

export default router;
