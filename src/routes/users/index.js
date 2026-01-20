import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  updateProfile,
  me,
} from "../../controllers/users.controller.js";

const router = Router();

router.get("/", getAllUsers);
router.put("/profile", updateProfile);
router.put("/reset-password", updatePassword);
router.get("/me", me);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
