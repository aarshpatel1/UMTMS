import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "UMTMS",
	password: "aarshadmin@123",
	port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/rail-track", async (req, res) => {
	const data = await db.query("SELECT * from umtms.rail_track");
	return res.send({
		data: data,
		statusCode: 200,
	});
});

app.get("/transit-schedule", async (req, res) => {
	const data = await db.query("SELECT * from umtms.transit_schedule");
	return res.send({
		data: data,
		statusCode: 200,
	});
});

app.get("/passenger", async (req, res) => {
	const data = await db.query("SELECT * from umtms.passenger");
	return res.send({
		data: data,
		statusCode: 200,
	});
});

app.get("/train", async (req, res) => {
	const data = await db.query("SELECT * from umtms.train");
	return res.send({
		data: data,
		statusCode: 200,
	});
});

app.get("/bus", async (req, res) => {
	const data = await db.query("SELECT * from umtms.bus");
	return res.send({
		data: data,
		statusCode: 200,
	});
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
