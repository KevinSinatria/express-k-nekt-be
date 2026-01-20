import express from "express";
import {
  createStudent,
  deleteStudentByNIS,
  getAllStudents,
  getAllStudentsForExport,
  getStudentByNIS,
  importStudentsFromExcel,
  promoteStudents,
  updateStudentByNIS,
} from "../../controllers/students.controller.js";
import multer from "multer";
const router = express.Router();
const env = process.env.NODE_ENV;
let upload;
if (env === "production") {
  upload = multer({ dest: "/tmp" });
} else {
  upload = multer({ dest: "uploads/" });
}

router.get("/", getAllStudents);
router.get("/all", getAllStudentsForExport);
router.post("/promote", promoteStudents);
router.post("/import", upload.single("excelFile"), importStudentsFromExcel);
router.post("/", createStudent);
router.get("/:nis", getStudentByNIS);
router.put("/:nis", updateStudentByNIS);
router.delete("/:nis", deleteStudentByNIS);

export default router;
