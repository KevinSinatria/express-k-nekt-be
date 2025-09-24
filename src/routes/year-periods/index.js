import express from "express";
import {
  createYearPeriod,
  deleteYearPeriod,
  getAllYearPeriods,
} from "../../controllers/year-period.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getAllYearPeriods);
router.post("/", authenticate, createYearPeriod);
router.delete("/:id", authenticate, deleteYearPeriod);

export default router;
