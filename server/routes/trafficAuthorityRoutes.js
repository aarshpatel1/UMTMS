import express from "express";
import {
	getAllTrafficAuthorities,
	getTrafficAuthorityById,
	createTrafficAuthority,
	updateTrafficAuthority,
	deleteTrafficAuthority,
} from "../controller/trafficAuthorityController.js";

const router = express.Router();

router.get("/", getAllTrafficAuthorities);
router.get("/all-traffic-authorities", getAllTrafficAuthorities);
router.get("/:id", getTrafficAuthorityById);
router.post("/", createTrafficAuthority);
router.put("/:id", updateTrafficAuthority);
router.delete("/:id", deleteTrafficAuthority);

export default router;
