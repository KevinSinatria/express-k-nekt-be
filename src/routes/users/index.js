import { Router } from "express";
import {
  getAllUsers,
  getAllUsersForExport,
  getAllRoles,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  updateProfile,
  importUsersFromExcel,
  me,
} from "../../controllers/users.controller.js";
import multer from "multer";

const router = Router();
const env = process.env.NODE_ENV;
const upload = env === "production" ? multer({ dest: "/tmp" }) : multer({ dest: "uploads/" });

router.get("/", getAllUsers);
router.get("/all", getAllUsersForExport);
router.get("/roles", getAllRoles);
router.post("/import", upload.single("excelFile"), importUsersFromExcel);
router.put("/profile", updateProfile);
router.put("/reset-password", updatePassword);
router.get("/me", me);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
