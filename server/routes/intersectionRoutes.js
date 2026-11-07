import express from "express";
import {
	getAllIntersections,
	getIntersectionById,
	createIntersection,
	updateIntersection,
	deleteIntersection,
} from "../controller/intersectionController.js";

const router = express.Router();

router.get("/", getAllIntersections);
router.get("/all-intersections", getAllIntersections);
router.get("/:id", getIntersectionById);
router.post("/", createIntersection);
router.put("/:id", updateIntersection);
router.delete("/:id", deleteIntersection);

export default router;
