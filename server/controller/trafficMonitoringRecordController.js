import db from "../db/db.js";

// GET all traffic monitoring records
export const getAllTrafficMonitoringRecords = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.traffic_monitoring_record ORDER BY record_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// GET traffic monitoring record by ID
export const getTrafficMonitoringRecordById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.traffic_monitoring_record WHERE record_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic monitoring record not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// CREATE traffic monitoring record
export const createTrafficMonitoringRecord = async (req, res) => {
	try {
		const {
			record_id,
			vehicle_speed,
			traffic_volume,
			timestamp,
			history_id,
			sensor_id,
			camera_id,
			road_id,
		} = req.body;

		let query;
		let params;

		if (record_id !== undefined && record_id !== null && record_id !== "") {
			query = `INSERT INTO umtms.traffic_monitoring_record 
				(record_id, vehicle_speed, traffic_volume, timestamp, history_id, sensor_id, camera_id, road_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
			params = [
				record_id,
				vehicle_speed,
				traffic_volume,
				timestamp || new Date(),
				history_id,
				sensor_id,
				camera_id,
				road_id,
			];
		} else {
			query = `INSERT INTO umtms.traffic_monitoring_record 
				(vehicle_speed, traffic_volume, timestamp, history_id, sensor_id, camera_id, road_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
			params = [
				vehicle_speed,
				traffic_volume,
				timestamp || new Date(),
				history_id,
				sensor_id,
				camera_id,
				road_id,
			];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Traffic monitoring record created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// UPDATE traffic monitoring record by ID
export const updateTrafficMonitoringRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const allowedFields = [
			"vehicle_speed",
			"traffic_volume",
			"timestamp",
			"history_id",
			"sensor_id",
			"camera_id",
			"road_id",
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
		const query = `UPDATE umtms.traffic_monitoring_record SET ${updates.join(", ")} WHERE record_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic monitoring record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic monitoring record updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// DELETE traffic monitoring record by ID
export const deleteTrafficMonitoringRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.traffic_monitoring_record WHERE record_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic monitoring record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic monitoring record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
