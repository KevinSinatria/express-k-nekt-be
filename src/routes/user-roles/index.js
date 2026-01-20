import { Router } from "express";
import {
  createUserRole,
  deleteUserRole,
  getUserRolesByUserId,
} from "../../controllers/user-roles.controller.js";

const router = Router();

router.get("/:id", getUserRolesByUserId);
router.post("/", createUserRole);
router.delete("/:id", deleteUserRole);

export default router;
