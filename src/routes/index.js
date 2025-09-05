import express from "express";
import authRoutes from "./auth/index.js";
import violationsRoutes from "./violations/index.js";
import studentRoutes from "./students/index.js";
import classesRoutes from "./classes/index.js";
import violationTypesRoutes from "./violation-types/index.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/violations", authenticate, violationsRoutes);
router.use("/students", authenticate, studentRoutes);
router.use("/classes", authenticate, classesRoutes);
router.use("/violation-types", authenticate, violationTypesRoutes);

export default router;
