import db from "../db/db.js";
import { handleControllerError, validatePayload } from "../utils/validationHelper.js";

// GET all traffic authorities
export const getAllTrafficAuthorities = async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM umtms.traffic_authority ORDER BY authority_id ASC");
		return res.status(200).json({
			success: true,
			count: result.rowCount,
			data: result.rows,
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// GET traffic authority by ID
export const getTrafficAuthorityById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("SELECT * FROM umtms.traffic_authority WHERE authority_id = $1", [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic authority not found" });
		}
		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// CREATE traffic authority
export const createTrafficAuthority = async (req, res) => {
	try {
		const validation = validatePayload("traffic-authorities", req.body, false);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { authority_id, name, office } = req.body;
		let query;
		let params;

		if (authority_id !== undefined && authority_id !== null && authority_id !== "") {
			query = `INSERT INTO umtms.traffic_authority (authority_id, name, office)
				VALUES ($1, $2, $3) RETURNING *`;
			params = [authority_id, name, office];
		} else {
			query = `INSERT INTO umtms.traffic_authority (name, office)
				VALUES ($1, $2) RETURNING *`;
			params = [name, office];
		}

		const result = await db.query(query, params);
		return res.status(201).json({
			success: true,
			message: "Traffic authority created successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// UPDATE traffic authority by ID
export const updateTrafficAuthority = async (req, res) => {
	try {
		const validation = validatePayload("traffic-authorities", req.body, true);
		if (!validation.isValid) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
		}
		const { id } = req.params;
		const allowedFields = ["name", "office"];
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
		const query = `UPDATE umtms.traffic_authority SET ${updates.join(", ")} WHERE authority_id = $${index} RETURNING *`;
		const result = await db.query(query, params);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic authority not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic authority updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};

// DELETE traffic authority by ID
export const deleteTrafficAuthority = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await db.query("DELETE FROM umtms.traffic_authority WHERE authority_id = $1 RETURNING *", [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Traffic authority not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Traffic authority deleted successfully",
			data: result.rows[0],
		});
	} catch (error) {
		return handleControllerError(res, error);
	}
};
