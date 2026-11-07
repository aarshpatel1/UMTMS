import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all intersections
export const getAllIntersections = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.intersection ORDER BY intersection_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET intersection by ID
export const getIntersectionById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.intersection WHERE intersection_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Intersection not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE intersection
export const createIntersection = async (req, res) => {
	try {
		const validation = validatePayload("intersections", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { intersection_id, intersection_name, status, location_id, signal_id } = req.body;
		let query;
		let params;

		if (intersection_id !== undefined && intersection_id !== null && intersection_id !== "") {
			query = `INSERT INTO umtms.intersection (intersection_id, intersection_name, status, location_id, signal_id)
				VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			params = [intersection_id, intersection_name, status, location_id, signal_id];
		} else {
			query = `INSERT INTO umtms.intersection (intersection_name, status, location_id, signal_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [intersection_name, status, location_id, signal_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Intersection created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE intersection by ID
export const updateIntersection = async (req, res) => {
	try {
		const validation = validatePayload("intersections", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["intersection_name", "status", "location_id", "signal_id"];
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
		const query = `UPDATE umtms.intersection SET ${updates.join(", ")} WHERE intersection_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Intersection not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Intersection updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE intersection by ID
export const deleteIntersection = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.intersection WHERE intersection_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Intersection not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Intersection deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
