import db from "../db/db.js";

// GET all emergency vehicles
export const getAllEmergencyVehicles = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.emergency_vehicle ORDER BY emergency_vehicle_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET emergency vehicle by ID
export const getEmergencyVehicleById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.emergency_vehicle WHERE emergency_vehicle_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency vehicle not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE emergency vehicle
export const createEmergencyVehicle = async (req, res) => {
	try {
		const { emergency_vehicle_id, vehicle_type, status, location_id } = req.body;
		let query;
		let params;

		if (emergency_vehicle_id !== undefined && emergency_vehicle_id !== null && emergency_vehicle_id !== "") {
			query = `INSERT INTO umtms.emergency_vehicle (emergency_vehicle_id, vehicle_type, status, location_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [emergency_vehicle_id, vehicle_type, status, location_id];
		} else {
			query = `INSERT INTO umtms.emergency_vehicle (vehicle_type, status, location_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [vehicle_type, status, location_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Emergency vehicle created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE emergency vehicle by ID
export const updateEmergencyVehicle = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["vehicle_type", "status", "location_id"];
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
		const query = `UPDATE umtms.emergency_vehicle SET ${updates.join(", ")} WHERE emergency_vehicle_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Emergency vehicle updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE emergency vehicle by ID
export const deleteEmergencyVehicle = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.emergency_vehicle WHERE emergency_vehicle_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Emergency vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Emergency vehicle deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
