import { Router } from "express";
import {
    getAllViolationTypes,
    getViolationTypesById,
    createViolationType,
    updateViolationType,
    deleteViolationType,
} from "../../controllers/violation-types.controller.js";

const router = Router();

router.get("/", getAllViolationTypes);
router.get("/:id", getViolationTypesById);
router.post("/", createViolationType);
router.put("/:id", updateViolationType);
router.delete("/:id", deleteViolationType);

export default router;