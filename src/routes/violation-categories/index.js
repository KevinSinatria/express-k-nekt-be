import { Router } from "express";
import {
    getAllViolationCategories,
    getViolationCategoryById,
    createViolationCategory,
    updateViolationCategory,
    deleteViolationCategory,
} from "../../controllers/violation-categories.controller.js";

const router = Router();

router.get("/", getAllViolationCategories);
router.get("/:id", getViolationCategoryById);
router.post("/", createViolationCategory);
router.put("/:id", updateViolationCategory);
router.delete("/:id", deleteViolationCategory);

export default router;