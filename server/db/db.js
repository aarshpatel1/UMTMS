import pg from "pg";

const pool = new pg.Pool({
	user: "postgres",
	host: "localhost",
	database: "UMTMS",
	password: "aarshadmin@123",
	port: 5432,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
	console.warn("PostgreSQL unexpected pool notice:", err.message);
});

export default pool;
