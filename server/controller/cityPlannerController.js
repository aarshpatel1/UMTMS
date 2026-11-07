import db from "../db/db.js";

// GET all city planners
export const getAllCityPlanners = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.city_planner ORDER BY planner_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET city planner by ID
export const getCityPlannerById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.city_planner WHERE planner_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "City planner not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE city planner
export const createCityPlanner = async (req, res) => {
	try {
		const { planner_id, name, department } = req.body;
		let query;
		let params;

		if (planner_id !== undefined && planner_id !== null && planner_id !== "") {
			query = `INSERT INTO umtms.city_planner (planner_id, name, department)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [planner_id, name, department];
		} else {
			query = `INSERT INTO umtms.city_planner (name, department)
				VALUES ($1, $2) RETURNING *`;
			params = [name, department];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "City planner created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE city planner by ID
export const updateCityPlanner = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["name", "department"];
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
		const query = `UPDATE umtms.city_planner SET ${updates.join(", ")} WHERE planner_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "City planner not found" });
		}

		return res.status(200).json({
			success: true,
			message: "City planner updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE city planner by ID
export const deleteCityPlanner = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.city_planner WHERE planner_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "City planner not found" });
		}

		return res.status(200).json({
			success: true,
			message: "City planner deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
