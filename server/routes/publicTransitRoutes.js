import express from "express";
import {
	getAllPublicTransits,
	getPublicTransitById,
	createPublicTransit,
	updatePublicTransit,
	deletePublicTransit,
} from "../controller/publicTransitController.js";

const router = express.Router();

router.get("/", getAllPublicTransits);
router.get("/all-public-transits", getAllPublicTransits);
router.get("/:id", getPublicTransitById);
router.post("/", createPublicTransit);
router.put("/:id", updatePublicTransit);
router.delete("/:id", deletePublicTransit);

export default router;
