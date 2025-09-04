import express from "express";
import { helloWorld } from "../controllers/index.js";
import authRoutes from "./auth/index.js";

const router = express.Router();

// router.get("/", helloWorld);
router.use("/auth", authRoutes);

export default router;
