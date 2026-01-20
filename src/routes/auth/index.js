import express from "express";
import { loginController, me } from "../../controllers/auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginController);
router.get("/me", authenticate, me);

export default router;
