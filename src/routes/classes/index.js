import { Router } from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  importClassesFromExcel,
  getNextClassesPromote,
} from "../../controllers/classes.controller.js";
import multer from "multer";

const router = Router();
const env = process.env.NODE_ENV;
let upload;
if (env === "production") {
  upload = multer({ dest: "/tmp" });
} else {
  upload = multer({ dest: "uploads/" });
}

router.get("/", getAllClasses);
router.get("/next", getNextClassesPromote);
router.get("/:id", getClassById);
router.post("/", createClass);
router.post("/import", upload.single("excelFile"), importClassesFromExcel);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
