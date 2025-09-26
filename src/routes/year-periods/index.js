import express from "express";
import {
  createYearPeriod,
  deleteYearPeriod,
  getAllYearPeriods,
  getYearPeriodById,
} from "../../controllers/year-period.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllYearPeriods);
router.get("/:id", getYearPeriodById);
router.post("/", authenticate, createYearPeriod);
router.delete("/:id", authenticate, deleteYearPeriod);

export default router;
