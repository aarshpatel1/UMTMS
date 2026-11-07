import db from "../db/db.js";

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
		return res.status(500).json({ success: false, error: error.message });
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
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE monitored_in record
export const createMonitoredIn = async (req, res) => {
	try {
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
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE monitored_in record
export const deleteMonitoredIn = async (req, res) => {
	try {
		const { vehicle_id, signal_id, violation_id } = req.params;
		const result = await db.query(
			"DELETE FROM umtms.monitored_in WHERE vehicle_id = $1 AND signal_id = $2 AND violation_id = $3 RETURNING *",
			[vehicle_id, signal_id, violation_id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Monitored_in record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Monitored_in record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
