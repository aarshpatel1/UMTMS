import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all commits (supports optional query params: ?vehicle_id=...&violation_id=...)
export const getAllCommits = async (req, res) => {
	try {
		const { vehicle_id, violation_id } = req.query;
		let query = "SELECT * FROM umtms.commits";
		const conditions = [];
		const params = [];

		if (vehicle_id !== undefined) {
			params.push(vehicle_id);
			conditions.push(`vehicle_id = $${params.length}`);
		}
		if (violation_id !== undefined) {
			params.push(violation_id);
			conditions.push(`violation_id = $${params.length}`);
		}

		if (conditions.length > 0) {
			query += ` WHERE ${conditions.join(" AND ")}`;
		}

		query += " ORDER BY vehicle_id ASC, violation_id ASC";

		const result = await db.query(query, params);
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET single commit by vehicle_id and violation_id
export const getCommitByIds = async (req, res) => {
	try {
		const { vehicle_id, violation_id } = req.params;
		const result = await db.query(
			"SELECT * FROM umtms.commits WHERE vehicle_id = $1 AND violation_id = $2",
			[vehicle_id, violation_id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Commit record not found" });
		}

		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE commit
export const createCommit = async (req, res) => {
	try {
		const validation = validatePayload("commits", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { vehicle_id, violation_id } = req.body;
		if (vehicle_id === undefined || violation_id === undefined) {
			return res.status(400).json({
				success: false,
				message: "Both vehicle_id and violation_id are required",
			});
		}

		const result = await db.query(
			"INSERT INTO umtms.commits (vehicle_id, violation_id) VALUES ($1, $2) RETURNING *",
			[vehicle_id, violation_id]
		);

		return res.status(201).json({
			success: true,
			message: "Commit record created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE commit
export const deleteCommit = async (req, res) => {
	try {
		let { vehicle_id, violation_id } = req.params;
		if (!violation_id && req.params.id) {
			if (req.params.id.includes("-")) {
				[vehicle_id, violation_id] = req.params.id.split("-");
			} else {
				vehicle_id = req.params.id;
			}
		}
		let query = "DELETE FROM umtms.commits WHERE vehicle_id = $1";
		const params = [vehicle_id];
		if (violation_id) {
			query += " AND violation_id = $2";
			params.push(violation_id);
		}
		query += " RETURNING *";

		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Commit record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Commit record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE commit
export const updateCommit = async (req, res) => {
	try {
		const validation = validatePayload("commits", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const vehicle_id = req.params.vehicle_id || req.params.id || req.body.vehicle_id;
		const { violation_id } = req.body;

		const result = await db.query(
			"UPDATE umtms.commits SET violation_id = $1 WHERE vehicle_id = $2 RETURNING *",
			[violation_id, vehicle_id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Commit record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Commit record updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
