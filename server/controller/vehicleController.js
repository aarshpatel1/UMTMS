import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all vehicles
export const getAllVehicles = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.vehicle ORDER BY vehicle_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET vehicle by ID
export const getVehicleById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.vehicle WHERE vehicle_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Vehicle not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE vehicle
export const createVehicle = async (req, res) => {
	try {
		const validation = validatePayload("vehicles", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { vehicle_id, registration_number, vehicle_type } = req.body;
		let query;
		let params;

		if (vehicle_id !== undefined && vehicle_id !== null && vehicle_id !== "") {
			query = `INSERT INTO umtms.vehicle (vehicle_id, registration_number, vehicle_type)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [vehicle_id, registration_number, vehicle_type];
		} else {
			query = `INSERT INTO umtms.vehicle (registration_number, vehicle_type)
				VALUES ($1, $2) RETURNING *`;
			params = [registration_number, vehicle_type];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Vehicle created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE vehicle by ID
export const updateVehicle = async (req, res) => {
	try {
		const validation = validatePayload("vehicles", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["registration_number", "vehicle_type"];
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
		const query = `UPDATE umtms.vehicle SET ${updates.join(", ")} WHERE vehicle_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE vehicle by ID
export const deleteVehicle = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.vehicle WHERE vehicle_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
