import e from "express";
import { helloWorld } from "../controllers/index.js";

const router = e.Router();

router.get("/", helloWorld);

export default router;
