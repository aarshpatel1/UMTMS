import express from "express";
import {
	getAllCommits,
	getCommitByIds,
	createCommit,
	updateCommit,
	deleteCommit,
} from "../controller/commitsController.js";

const router = express.Router();

router.get("/", getAllCommits);
router.get("/all-commits", getAllCommits);
router.get("/:vehicle_id/:violation_id", getCommitByIds);
router.get("/:id", (req, res) => {
	const [vehicle_id, violation_id] = req.params.id.split("-");
	req.params.vehicle_id = vehicle_id;
	req.params.violation_id = violation_id;
	return getCommitByIds(req, res);
});
router.post("/", createCommit);
router.put("/:vehicle_id/:violation_id", updateCommit);
router.put("/:id", updateCommit);
router.delete("/:vehicle_id/:violation_id", deleteCommit);
router.delete("/:id", deleteCommit);

export default router;
