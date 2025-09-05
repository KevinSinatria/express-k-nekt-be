import express from "express";
import {
	createStudent,
	deleteStudentByNIS,
	getAllStudents,
	getStudentByNIS,
	updateStudentByNIS,
} from "../../controllers/students.controller.js";
const router = express.Router();

router.get("/", getAllStudents);
router.post("/", createStudent);
router.get("/:nis", getStudentByNIS);
router.put("/:nis", updateStudentByNIS);
router.delete("/:nis", deleteStudentByNIS);

export default router;
