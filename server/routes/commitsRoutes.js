import express from "express";
import {
	getAllCommits,
	getCommitByIds,
	createCommit,
	deleteCommit,
} from "../controller/commitsController.js";

const router = express.Router();

router.get("/", getAllCommits);
router.get("/all-commits", getAllCommits);
router.get("/:vehicle_id/:violation_id", getCommitByIds);
router.post("/", createCommit);
router.delete("/:vehicle_id/:violation_id", deleteCommit);

export default router;
