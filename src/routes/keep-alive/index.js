import express from "express";
import { keepAlive } from "../../controllers/keep-alive.controller.js";

const router = express.Router();

router.get("/", keepAlive);

export default router;
