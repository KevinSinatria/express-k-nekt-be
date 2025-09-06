import prisma from "../models/prisma.js";

export const getAllClasses = async (req, res) => {
    try {
        const classes = await prisma.classes.findMany({
            include: {
                detail_students: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Classes retrivied successfully",
            code: 200,
            data: classes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve classes",
            code: 500,
            error: error.message,
        });
    }
};

export const getClassById = async (req, res) => {
    const { id } = req.params;
    try {
        const classData = await prisma.classes.findUnique({
            where: { id: parseInt(id) },
            include: {
                detail_students: true,
            },
        });

        if (!classData) {
            res.status(404).json({
                success: false,
                message: "Class not found",
                code: 404,
            });
        }

        res.status(200).json({
            success: true,
            message: "Class retrivied successfully",
            code: 200,
            data: classData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve class",
            code: 500,
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
            code: 201,
            data: newClass,
         });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create class",
            code: 500,
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
            res.status(404).json({
                success: false,
                message: "Class not found",
                code: 404,
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
            code: 200,
            data: updatedClass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update class",
            code: 500,
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
            res.status(404).json({
                success: false,
                message: "Class not found",
                code: 404,
            });
        }

        const deletedClass = await prisma.classes.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            success: true,
            message: "Class deleted successfully",
            code: 200,
            data: deletedClass,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete class",
            code: 500,
            error: error.message,
        });
    }
};