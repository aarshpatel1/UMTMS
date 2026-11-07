import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all rail tracks
export const getAllRailTracks = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.rail_track ORDER BY track_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// Aliased export for backwards compatibility
export const getRailTracks = getAllRailTracks;

// GET rail track by ID
export const getRailTrackById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.rail_track WHERE track_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Rail track record not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE rail track
export const createRailTrack = async (req, res) => {
	try {
		const validation = validatePayload("rail-tracks", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { track_id, track_number, availability } = req.body;
		let result;

		if (track_id !== undefined && track_id !== null && track_id !== "") {
			result = await db.query(
				"INSERT INTO umtms.rail_track (track_id, track_number, availability) VALUES ($1, $2, $3) RETURNING *",
				[track_id, track_number, availability]
			);
		} else {
			result = await db.query(
				"INSERT INTO umtms.rail_track (track_number, availability) VALUES ($1, $2) RETURNING *",
				[track_number, availability]
			);
		}

		return res.status(201).json({
			success: true,
			message: "Rail track created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE rail track by ID
export const updateRailTrack = async (req, res) => {
	try {
		const validation = validatePayload("rail-tracks", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["track_number", "availability"];
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
		const query = `UPDATE umtms.rail_track SET ${updates.join(", ")} WHERE track_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Rail track record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Rail track updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE rail track by ID
export const deleteRailTrack = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.rail_track WHERE track_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Rail track record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Rail track deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
