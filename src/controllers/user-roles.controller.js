import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getUserRolesByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const userRolesData = await paginate(
      prisma.user_role,
      req,
      {
        user_id: id,
      },
      {
        user_id: "asc",
      },
      {
        id: true,
        user_id: true,
        role_id: true,
      },
      10
    );

    res.status(200).json({
      success: true,
      message: "User roles retrieved successfully",
      code: 200,
      data: userRolesData.data,
      meta: userRolesData.pagination,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user roles",
      code: 500,
      error: err.message,
    });
  }
};

export const createUserRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const userRole = await prisma.user_role.create({
      data: {
        user_id: user_id,
        role_id: role_id,
      },
    });

    res.status(201).json({
      success: true,
      message: "User role created successfully",
      code: 201,
      data: userRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create user role",
      code: 500,
      error: err.message,
    });
  }
};

export const deleteUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    const userRole = await prisma.user_role.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "User role deleted successfully",
      code: 200,
      data: userRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete user role",
      code: 500,
      error: err.message,
    });
  }
};
