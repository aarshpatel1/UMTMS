import express from "express";
import bodyParser from "body-parser";
import "./db/db.js";
import router from "./routes/index.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) =>
	res.status(200).json({ message: "Server is running..!!" }),
);

app.use("/api", router);

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
