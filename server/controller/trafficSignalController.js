import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all traffic signals
export const getAllTrafficSignals = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.traffic_signal ORDER BY signal_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET traffic signal by ID
export const getTrafficSignalById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.traffic_signal WHERE signal_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic signal not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE traffic signal
export const createTrafficSignal = async (req, res) => {
	try {
		const validation = validatePayload("traffic-signals", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { signal_id, timing_pattern, status, authority_id } = req.body;
		let query;
		let params;

		if (signal_id !== undefined && signal_id !== null && signal_id !== "") {
			query = `INSERT INTO umtms.traffic_signal (signal_id, timing_pattern, status, authority_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [signal_id, timing_pattern, status, authority_id];
		} else {
			query = `INSERT INTO umtms.traffic_signal (timing_pattern, status, authority_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [timing_pattern, status, authority_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Traffic signal created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE traffic signal by ID
export const updateTrafficSignal = async (req, res) => {
	try {
		const validation = validatePayload("traffic-signals", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["timing_pattern", "status", "authority_id"];
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
		const query = `UPDATE umtms.traffic_signal SET ${updates.join(", ")} WHERE signal_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic signal not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic signal updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE traffic signal by ID
export const deleteTrafficSignal = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.traffic_signal WHERE signal_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic signal not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic signal deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
