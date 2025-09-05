import express from "express";
import { getStatsOverview } from "../../controllers/stats-overview.controller.js";
const router = express.Router();

router.get("/", getStatsOverview);

export default router;
