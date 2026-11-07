import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all public transits
export const getAllPublicTransits = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.public_transit ORDER BY transit_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET public transit by ID
export const getPublicTransitById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.public_transit WHERE transit_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Public transit record not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE new public transit
export const createPublicTransit = async (req, res) => {
	try {
		const validation = validatePayload("public-transits", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { transit_id, transit_type } = req.body;
		if (!transit_type && transit_type !== "") {
			return res.status(400).json({ success: false, message: "transit_type is required" });
		}

		let result;
		if (transit_id !== undefined && transit_id !== null && transit_id !== "") {
			result = await db.query(
				"INSERT INTO umtms.public_transit (transit_id, transit_type) VALUES ($1, $2) RETURNING *",
				[transit_id, transit_type]
			);
		} else {
			result = await db.query(
				"INSERT INTO umtms.public_transit (transit_type) VALUES ($1) RETURNING *",
				[transit_type]
			);
		}

		return res.status(201).json({
			success: true,
			message: "Public transit record created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE public transit by ID
export const updatePublicTransit = async (req, res) => {
	try {
		const validation = validatePayload("public-transits", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const { transit_type } = req.body;

		if (transit_type === undefined) {
			return res.status(400).json({ success: false, message: "No valid fields provided for update" });
		}

		const result = await db.query(
			"UPDATE umtms.public_transit SET transit_type = $1 WHERE transit_id = $2 RETURNING *",
			[transit_type, id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Public transit record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Public transit record updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE public transit by ID
export const deletePublicTransit = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.public_transit WHERE transit_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Public transit record not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Public transit record deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
