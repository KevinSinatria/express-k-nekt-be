import e from "express";
import { helloWorld } from "../controllers/index.js";
import AuthRoutes from "./auth/index.js";

const router = e.Router();

router.get("/", helloWorld);
router.get("/auth", AuthRoutes);

export default router;
