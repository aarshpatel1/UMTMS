import db from "../db/db.js";

// GET all buses
export const getAllBuses = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.bus ORDER BY bus_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET bus by ID
export const getBusById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.bus WHERE bus_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Bus not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE bus
export const createBus = async (req, res) => {
	try {
		const { bus_id, route_number, capacity, transit_id } = req.body;
		let query;
		let params;

		if (bus_id !== undefined && bus_id !== null && bus_id !== "") {
			query = `INSERT INTO umtms.bus (bus_id, route_number, capacity, transit_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [bus_id, route_number, capacity, transit_id];
		} else {
			query = `INSERT INTO umtms.bus (route_number, capacity, transit_id)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [route_number, capacity, transit_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Bus created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE bus by ID
export const updateBus = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["route_number", "capacity", "transit_id"];
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
		const query = `UPDATE umtms.bus SET ${updates.join(", ")} WHERE bus_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Bus not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Bus updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE bus by ID
export const deleteBus = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.bus WHERE bus_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Bus not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Bus deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
