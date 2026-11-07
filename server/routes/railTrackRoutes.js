import express from "express";
import {
	getAllRailTracks,
	getRailTracks,
	getRailTrackById,
	createRailTrack,
	updateRailTrack,
	deleteRailTrack,
} from "../controller/railTrackController.js";

const router = express.Router();

router.get("/", getAllRailTracks);
router.get("/all-rail-tracks", getRailTracks);
router.get("/:id", getRailTrackById);
router.post("/", createRailTrack);
router.put("/:id", updateRailTrack);
router.delete("/:id", deleteRailTrack);

export default router;
