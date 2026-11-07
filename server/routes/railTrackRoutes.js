import express from "express";
import { getRailTracks } from "../controller/railTrackController.js";

const router = express.Router();
router.get("/", (req, res) => {
	return res.status(200).json({
		message: "Rail Tracks API is running..!!",
	});
});
router.get("/all-rail-tracks", getRailTracks);

export default router;
