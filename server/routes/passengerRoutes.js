import express from "express";
import {
	getAllPassengers,
	getPassengerById,
	createPassenger,
	updatePassenger,
	deletePassenger,
} from "../controller/passengerController.js";

const router = express.Router();

router.get("/", getAllPassengers);
router.get("/all-passengers", getAllPassengers);
router.get("/:id", getPassengerById);
router.post("/", createPassenger);
router.put("/:id", updatePassenger);
router.delete("/:id", deletePassenger);

export default router;
