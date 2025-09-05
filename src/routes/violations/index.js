import express from "express";
import {
	createViolation,
	deleteViolationById,
	getAllViolations,
	getViolationById,
	implementViolation,
	unimplementViolation,
	updateViolationById,
} from "../../controllers/violations.controller.js";

const router = express.Router();

router.get("/", getAllViolations);
router.post("/", createViolation);
router.get("/:id", getViolationById);
router.put("/:id", updateViolationById);
router.delete("/:id", deleteViolationById);
router.put("/implement/:id", implementViolation);
router.put("/unimplement/:id", unimplementViolation);

export default router;
