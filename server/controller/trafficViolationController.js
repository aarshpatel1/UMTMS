import db from "../db/db.js";

// GET all traffic violations
export const getAllTrafficViolations = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.traffic_violation ORDER BY violation_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET traffic violation by ID
export const getTrafficViolationById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.traffic_violation WHERE violation_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic violation not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE traffic violation
export const createTrafficViolation = async (req, res) => {
	try {
		const {
			violation_id,
			violation_type,
			violation_date,
			violation_time,
			fine_status,
			fine_amount,
			authority_id,
		} = req.body;

		let query;
		let params;

		if (violation_id !== undefined && violation_id !== null && violation_id !== "") {
			query = `INSERT INTO umtms.traffic_violation 
				(violation_id, violation_type, violation_date, violation_time, fine_status, fine_amount, authority_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
			params = [
				violation_id,
				violation_type,
				violation_date,
				violation_time,
				fine_status,
				fine_amount,
				authority_id,
			];
		} else {
			query = `INSERT INTO umtms.traffic_violation 
				(violation_type, violation_date, violation_time, fine_status, fine_amount, authority_id)
				VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
			params = [
				violation_type,
				violation_date,
				violation_time,
				fine_status,
				fine_amount,
				authority_id,
			];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Traffic violation created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE traffic violation by ID
export const updateTrafficViolation = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = [
			"violation_type",
			"violation_date",
			"violation_time",
			"fine_status",
			"fine_amount",
			"authority_id",
		];
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
		const query = `UPDATE umtms.traffic_violation SET ${updates.join(", ")} WHERE violation_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic violation not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic violation updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE traffic violation by ID
export const deleteTrafficViolation = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.traffic_violation WHERE violation_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic violation not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic violation deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
