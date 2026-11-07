import db from "../db/db.js";

// GET all traffic cameras
export const getAllTrafficCameras = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.traffic_camera ORDER BY camera_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET traffic camera by ID
export const getTrafficCameraById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.traffic_camera WHERE camera_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic camera not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE traffic camera
export const createTrafficCamera = async (req, res) => {
	try {
		const { camera_id, camera_type, status, record_id, location_id } = req.body;
		let query;
		let params;

		if (camera_id !== undefined && camera_id !== null && camera_id !== "") {
			query = `INSERT INTO umtms.traffic_camera (camera_id, camera_type, status, record_id, location_id)
				VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			params = [camera_id, camera_type, status, record_id, location_id];
		} else {
			query = `INSERT INTO umtms.traffic_camera (camera_type, status, record_id, location_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [camera_type, status, record_id, location_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Traffic camera created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE traffic camera by ID
export const updateTrafficCamera = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["camera_type", "status", "record_id", "location_id"];
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
		const query = `UPDATE umtms.traffic_camera SET ${updates.join(", ")} WHERE camera_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic camera not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic camera updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE traffic camera by ID
export const deleteTrafficCamera = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.traffic_camera WHERE camera_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic camera not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic camera deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
