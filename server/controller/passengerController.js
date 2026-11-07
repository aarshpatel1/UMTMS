import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all passengers
export const getAllPassengers = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.passenger ORDER BY passenger_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET passenger by ID
export const getPassengerById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.passenger WHERE passenger_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Passenger record not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE passenger
export const createPassenger = async (req, res) => {
	try {
		const validation = validatePayload("passengers", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { passenger_id, passenger_count, bus_id, train_id } = req.body;
		let query;
		let params;

		if (passenger_id !== undefined && passenger_id !== null && passenger_id !== "") {
			query = `INSERT INTO umtms.passenger (passenger_id, passenger_count, bus_id, train_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [passenger_id, passenger_count, bus_id, train_id];
		} else {
			query = `INSERT INTO umtms.passenger (passenger_count, bus_id, train_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [passenger_count, bus_id, train_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Passenger record created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE passenger by ID
export const updatePassenger = async (req, res) => {
	try {
		const validation = validatePayload("passengers", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["passenger_count", "bus_id", "train_id"];
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
		const query = `UPDATE umtms.passenger SET ${updates.join(", ")} WHERE passenger_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Passenger record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Passenger record updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE passenger by ID
export const deletePassenger = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.passenger WHERE passenger_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Passenger record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Passenger record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
