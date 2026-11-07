import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all emergency responses
export const getAllEmergencyResponses = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.emergency_response ORDER BY response_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET emergency response by ID
export const getEmergencyResponseById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.emergency_response WHERE response_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency response not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE emergency response
export const createEmergencyResponse = async (req, res) => {
	try {
		const validation = validatePayload("emergency-responses", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { response_id, response_status, emergency_id } = req.body;
		let query;
		let params;

		if (response_id !== undefined && response_id !== null && response_id !== "") {
			query = `INSERT INTO umtms.emergency_response (response_id, response_status, emergency_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [response_id, response_status, emergency_id];
		} else {
			query = `INSERT INTO umtms.emergency_response (response_status, emergency_id)
				VALUES ($1, $2) RETURNING *`;
			params = [response_status, emergency_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Emergency response created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE emergency response by ID
export const updateEmergencyResponse = async (req, res) => {
	try {
		const validation = validatePayload("emergency-responses", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["response_status", "emergency_id"];
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
		const query = `UPDATE umtms.emergency_response SET ${updates.join(", ")} WHERE response_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency response not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Emergency response updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE emergency response by ID
export const deleteEmergencyResponse = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.emergency_response WHERE response_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency response not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Emergency response deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
