import express from "express";
import railTrackRoutes from "./railTrackRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
	return res.status(200).json({
		message: "API is running..!!",
	});
});

router.use("/rail-tracks", railTrackRoutes);
export default router;
