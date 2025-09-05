import express from "express";
import authRoutes from "./auth/index.js";
import violationsRoutes from "./violations/index.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/violations", authenticate, violationsRoutes);

export default router;
