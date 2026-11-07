import db from "../db/db.js";

export const getRailTracks = async (req, res) => {
	const data = await db.query("SELECT * from umtms.rail_track");
	return res.status(200).send({
		data: data,
	});
};
