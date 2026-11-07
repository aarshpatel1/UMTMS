import express from "express";
import {
	getAllCityPlanners,
	getCityPlannerById,
	createCityPlanner,
	updateCityPlanner,
	deleteCityPlanner,
} from "../controller/cityPlannerController.js";

const router = express.Router();

router.get("/", getAllCityPlanners);
router.get("/all-city-planners", getAllCityPlanners);
router.get("/:id", getCityPlannerById);
router.post("/", createCityPlanner);
router.put("/:id", updateCityPlanner);
router.delete("/:id", deleteCityPlanner);

export default router;
