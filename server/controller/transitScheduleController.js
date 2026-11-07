import db from "../db/db.js";

// GET all transit schedules
export const getAllTransitSchedules = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.transit_schedule ORDER BY schedule_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET transit schedule by ID
export const getTransitScheduleById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.transit_schedule WHERE schedule_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Transit schedule not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE transit schedule
export const createTransitSchedule = async (req, res) => {
	try {
		const { schedule_id, arrival_time, departure_time, bus_id, train_id } = req.body;
		let query;
		let params;

		if (schedule_id !== undefined && schedule_id !== null && schedule_id !== "") {
			query = `INSERT INTO umtms.transit_schedule (schedule_id, arrival_time, departure_time, bus_id, train_id)
				VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			params = [schedule_id, arrival_time, departure_time, bus_id, train_id];
		} else {
			query = `INSERT INTO umtms.transit_schedule (arrival_time, departure_time, bus_id, train_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [arrival_time, departure_time, bus_id, train_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Transit schedule created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE transit schedule by ID
export const updateTransitSchedule = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = ["arrival_time", "departure_time", "bus_id", "train_id"];
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
		const query = `UPDATE umtms.transit_schedule SET ${updates.join(", ")} WHERE schedule_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Transit schedule not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Transit schedule updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE transit schedule by ID
export const deleteTransitSchedule = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.transit_schedule WHERE schedule_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Transit schedule not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Transit schedule deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
