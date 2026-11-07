import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all roads
export const getAllRoads = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.road ORDER BY road_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET road by ID
export const getRoadById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.road WHERE road_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE road
export const createRoad = async (req, res) => {
	try {
		const validation = validatePayload("roads", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { road_id, road_name, road_type } = req.body;
		let query;
		let params;

		if (road_id !== undefined && road_id !== null && road_id !== "") {
			query = `INSERT INTO umtms.road (road_id, road_name, road_type)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [road_id, road_name, road_type];
		} else {
			query = `INSERT INTO umtms.road (road_name, road_type)
				VALUES ($1, $2) RETURNING *`;
			params = [road_name, road_type];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Road created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE road by ID
export const updateRoad = async (req, res) => {
	try {
		const validation = validatePayload("roads", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["road_name", "road_type"];
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
		const query = `UPDATE umtms.road SET ${updates.join(", ")} WHERE road_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Road updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE road by ID
export const deleteRoad = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.road WHERE road_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Road deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
