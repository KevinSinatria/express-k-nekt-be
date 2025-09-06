import prisma from "../models/prisma.js";

export const getAllClasses = async (req, res) => {
    try {
        const classes = await prisma.classes.findMany();
        res.status(200).json({
            success: true,
            message: "Classes retrivied successfully",
            data: classes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve classes",
            error: error.message,
        });
    }
};

export const getClassById = async (req, res) => {
    const { id } = req.params;
    try {
        const classData = await prisma.classes.findUnique({
            where: { id: parseInt(id) },
        });

        if (!classData) {
            res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Class retrivied successfully",
            data: classData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve class",
            error: error.message,
        });
    }
};

export const createClass = async (req, res) => {
    const { class: className } = req.body;
    try {
        const existingClass = await prisma.classes.findFirst({
            where: {
                class: {
                    contains: className,
                },
            },
        });

        if (existingClass) {
            return res.status(409).json({
                success: false,
                message: "Class already exists",
                code: 409,
            });
        }

         const newClass = await prisma.classes.create({
            data: {
                class: className,
            },
         });

         res.status(201).json({
            success: true,
            message: "Class created successfully",
            data: newClass,
         });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create class",
            error: error.message,
        });
    }
};

export const updateClass = async (req, res) => {
    const { id } = req.params;
    const { class: className } = req.body;
    try {
        const existingClass = await prisma.classes.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingClass) {
            res.status(401).json({
                success: false,
                message: "Class not found",
            });
        }

        const updatedClass = await prisma.classes.update({
            where: { id: parseInt(id) },
            data: {
                class: className,
            },
        });
        res.status(200).json({
            success: true,
            message: "Class updated successfully",
            data: updatedClass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update class",
            error: error.message,
        });
    }
};

export const deleteClass = async (req, res) => {
    const { id } = req.params;
    try {
        const existingClass = await prisma.classes.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingClass) {
            res.status(401).json({
                success: false,
                message: "Class not found",
            });
        }

        const deletedClass = await prisma.classes.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            success: true,
            message: "Class deleted successfully",
            data: deletedClass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete class",
            error: error.message,
        });
    }
};