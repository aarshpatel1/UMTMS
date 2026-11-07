import db from "../db/db.js";

// GET all locations
export const getAllLocations = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.location ORDER BY location_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET location by ID
export const getLocationById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.location WHERE location_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Location not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE location
export const createLocation = async (req, res) => {
	try {
		const { location_id, latitude, longitude } = req.body;
		let query;
		let params;

		if (location_id !== undefined && location_id !== null && location_id !== "") {
			query = `INSERT INTO umtms.location (location_id, latitude, longitude)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [location_id, latitude, longitude];
		} else {
			query = `INSERT INTO umtms.location (latitude, longitude)
				VALUES ($1, $2) RETURNING *`;
			params = [latitude, longitude];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Location created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE location by ID
export const updateLocation = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["latitude", "longitude"];
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
		const query = `UPDATE umtms.location SET ${updates.join(", ")} WHERE location_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Location not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Location updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE location by ID
export const deleteLocation = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.location WHERE location_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Location not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Location deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
