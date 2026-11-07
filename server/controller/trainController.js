import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all trains
export const getAllTrains = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.train ORDER BY train_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET train by ID
export const getTrainById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.train WHERE train_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Train not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE train
export const createTrain = async (req, res) => {
	try {
		const validation = validatePayload("trains", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { train_id, train_number, capacity, transit_id, track_id } = req.body;
		let query;
		let params;

		if (train_id !== undefined && train_id !== null && train_id !== "") {
			query = `INSERT INTO umtms.train (train_id, train_number, capacity, transit_id, track_id)
				VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			params = [train_id, train_number, capacity, transit_id, track_id];
		} else {
			query = `INSERT INTO umtms.train (train_number, capacity, transit_id, track_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [train_number, capacity, transit_id, track_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Train created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE train by ID
export const updateTrain = async (req, res) => {
	try {
		const validation = validatePayload("trains", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["train_number", "capacity", "transit_id", "track_id"];
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
		const query = `UPDATE umtms.train SET ${updates.join(", ")} WHERE train_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Train not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Train updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE train by ID
export const deleteTrain = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.train WHERE train_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Train not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Train deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
