import express from "express";
import {
  createViolation,
  deleteViolationById,
  getAllViolations,
  getAllViolationsForExport,
  getFilterDataForm,
  getViolationById,
  implementViolation,
  unimplementViolation,
  updateViolationById,
} from "../../controllers/violations.controller.js";

const router = express.Router();

router.get("/", getAllViolations);
router.get("/all", getAllViolationsForExport);
router.get("/filter-data-form", getFilterDataForm);
router.post("/", createViolation);
router.get("/:id", getViolationById);
router.put("/:id", updateViolationById);
router.delete("/:id", deleteViolationById);
router.put("/:id/implement", implementViolation);
router.put("/:id/unimplement", unimplementViolation);

export default router;
