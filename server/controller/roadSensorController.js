import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all road sensors
export const getAllRoadSensors = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.road_sensor ORDER BY sensor_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET road sensor by ID
export const getRoadSensorById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.road_sensor WHERE sensor_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road sensor not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE road sensor
export const createRoadSensor = async (req, res) => {
	try {
		const validation = validatePayload("road-sensors", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { sensor_id, sensor_type, status, road_id, location_id } = req.body;
		let query;
		let params;

		if (sensor_id !== undefined && sensor_id !== null && sensor_id !== "") {
			query = `INSERT INTO umtms.road_sensor (sensor_id, sensor_type, status, road_id, location_id)
				VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			params = [sensor_id, sensor_type, status, road_id, location_id];
		} else {
			query = `INSERT INTO umtms.road_sensor (sensor_type, status, road_id, location_id)
				VALUES ($1, $2, $3, $4) RETURNING *`;
			params = [sensor_type, status, road_id, location_id];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Road sensor created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE road sensor by ID
export const updateRoadSensor = async (req, res) => {
	try {
		const validation = validatePayload("road-sensors", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["sensor_type", "status", "road_id", "location_id"];
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
		const query = `UPDATE umtms.road_sensor SET ${updates.join(", ")} WHERE sensor_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road sensor not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Road sensor updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE road sensor by ID
export const deleteRoadSensor = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.road_sensor WHERE sensor_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Road sensor not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Road sensor deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
