import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                username: true,
                password: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            code: 200,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve users",
            code: 500,
            error: error.message,
        });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                password: true,
                username: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: 404,
            });
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            code: 200,
            data: user,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
            code: 500,
            error: error.message,
        });
    }
};

export const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await prisma.users.findFirst({
            where: {
                username: {
                    contains: username,
                },
            },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User is already exists",
                code: 409,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                username: username,
                password: hashedPassword,
                role: role,
            },
        });

        const userData = {
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
        };

        res.status(201).json({
            success: true,
            message: "User created successfully",
            code: 201,
            data: userData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            code: 500,
            error: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    try {
        const existingUser = await prisma.users.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: 404,
            });
        }

        const updateData = {};
        if (username) {
            updateData.username = username;
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (role) {
            updateData.role = role;
        }

        const updateUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                password: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            code: 200,
            data: updateUser,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            code: 500,
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const existingUser = await prisma.users.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: 404,
            });
        }

        const deletedUser = await prisma.users.delete({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                password: true,
                role: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            code: 200,
            data: deletedUser,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            code: 500,
            error: error.message,
        });
    }
}