import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all monitored_in records (supports query params: ?vehicle_id=...&signal_id=...&violation_id=...)
export const getAllMonitoredIn = async (req, res) => {
	try {
		const { vehicle_id, signal_id, violation_id } = req.query;
		let query = "SELECT * FROM umtms.monitored_in";
		const conditions = [];
		const params = [];

		if (vehicle_id !== undefined) {
			params.push(vehicle_id);
			conditions.push(`vehicle_id = $${params.length}`);
		}
		if (signal_id !== undefined) {
			params.push(signal_id);
			conditions.push(`signal_id = $${params.length}`);
		}
		if (violation_id !== undefined) {
			params.push(violation_id);
			conditions.push(`violation_id = $${params.length}`);
		}

		if (conditions.length > 0) {
			query += ` WHERE ${conditions.join(" AND ")}`;
		}

		query += " ORDER BY vehicle_id ASC, signal_id ASC, violation_id ASC";

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

// GET single monitored_in record
export const getMonitoredInByIds = async (req, res) => {
	try {
		const { vehicle_id, signal_id, violation_id } = req.params;
		const result = await db.query(
			"SELECT * FROM umtms.monitored_in WHERE vehicle_id = $1 AND signal_id = $2 AND violation_id = $3",
			[vehicle_id, signal_id, violation_id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Monitored_in record not found" });
		}

		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE monitored_in record
export const createMonitoredIn = async (req, res) => {
	try {
		const validation = validatePayload("monitored-in", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { vehicle_id, signal_id, violation_id } = req.body;
		if (vehicle_id === undefined || signal_id === undefined || violation_id === undefined) {
			return res.status(400).json({
				success: false,
				message: "vehicle_id, signal_id, and violation_id are all required",
			});
		}

		const result = await db.query(
			"INSERT INTO umtms.monitored_in (vehicle_id, signal_id, violation_id) VALUES ($1, $2, $3) RETURNING *",
			[vehicle_id, signal_id, violation_id]
		);

		return res.status(201).json({
			success: true,
			message: "Monitored_in record created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE monitored_in record
export const deleteMonitoredIn = async (req, res) => {
	try {
		let { vehicle_id, signal_id, violation_id } = req.params;
		if (!signal_id && req.params.id) {
			if (req.params.id.includes("-")) {
				[vehicle_id, signal_id, violation_id] = req.params.id.split("-");
			} else {
				vehicle_id = req.params.id;
			}
		}
		let query = "DELETE FROM umtms.monitored_in WHERE vehicle_id = $1";
		const params = [vehicle_id];
		if (signal_id) {
			query += " AND signal_id = $2";
			params.push(signal_id);
			if (violation_id) {
				query += " AND violation_id = $3";
				params.push(violation_id);
			}
		}
		query += " RETURNING *";

		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Monitored_in record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Monitored_in record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE monitored_in record
export const updateMonitoredIn = async (req, res) => {
	try {
		const validation = validatePayload("monitored-in", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const vehicle_id = req.params.vehicle_id || req.params.id || req.body.vehicle_id;
		const { signal_id, violation_id } = req.body;

		const updates = [];
		const params = [];
		let index = 1;

		if (signal_id !== undefined) {
			updates.push(`signal_id = $${index++}`);
			params.push(signal_id);
		}
		if (violation_id !== undefined) {
			updates.push(`violation_id = $${index++}`);
			params.push(violation_id);
		}

		if (updates.length === 0) {
			return res.status(400).json({ success: false, message: "No fields provided to update" });
		}

		params.push(vehicle_id);
		const result = await db.query(
			`UPDATE umtms.monitored_in SET ${updates.join(", ")} WHERE vehicle_id = $${index} RETURNING *`,
			params
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Monitored_in record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Monitored_in record updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
