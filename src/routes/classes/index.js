import { Router } from "express";
import {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} from "../../controllers/classes.controller.js";

const router = Router();

router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;