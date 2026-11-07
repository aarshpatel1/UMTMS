import pg from "pg";

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "UMTMS",
	password: "aarshadmin@123",
	port: 5432,
});

db.connect().catch((err) => {
	console.warn("PostgreSQL connection notice:", err.message);
});

export default db;
