import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all historical traffic data
export const getAllHistoricalTrafficData = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.historical_traffic_data ORDER BY history_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET historical traffic data by ID
export const getHistoricalTrafficDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.historical_traffic_data WHERE history_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Historical traffic data not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE historical traffic data
export const createHistoricalTrafficData = async (req, res) => {
	try {
		const validation = validatePayload("historical-traffic-data", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { history_id, record_date, traffic_pattern, planner_id } = req.body;
		let query;
		let params;

		if (history_id !== undefined && history_id !== null && history_id !== "") {
			query = `INSERT INTO umtms.historical_traffic_data (history_id, record_date, traffic_pattern, planner_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [history_id, record_date, traffic_pattern, planner_id];
		} else {
			query = `INSERT INTO umtms.historical_traffic_data (record_date, traffic_pattern, planner_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [record_date, traffic_pattern, planner_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Historical traffic data created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE historical traffic data by ID
export const updateHistoricalTrafficData = async (req, res) => {
	try {
		const validation = validatePayload("historical-traffic-data", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["record_date", "traffic_pattern", "planner_id"];
		const updates = [];
		const params = [];
		let index = 1;

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				updates.push(`${field} = $${index++}`);
				params.push(req.body[field]);
			}
		}

		if (updates.length === 0) {
			return res.status(400).json({ success: false, message: "No valid fields provided for update" });
		}

		params.push(id);
		const query = `UPDATE umtms.historical_traffic_data SET ${updates.join(", ")} WHERE history_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Historical traffic data not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Historical traffic data updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE historical traffic data by ID
export const deleteHistoricalTrafficData = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.historical_traffic_data WHERE history_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Historical traffic data not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Historical traffic data deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
