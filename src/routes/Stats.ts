import express from "express";
import { adminOnly } from "../middlewares/Auth.js";
import {
  getBarChart,
  getDashboardStats,
  getLineChart,
  getPieChart,
} from "../controllers/Stats.js";
const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/pie", getPieChart);
router.get("/bar", getBarChart);
router.get("/line", getLineChart);

export default router;
