import prisma from "../models/prisma.js";

export const getAllViolationCategories = async (req, res) => {
    try {
        const violationCategories = await prisma.violation_category.findMany({
            include: {
                violation_type: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Violation categories retrivied successfully",
            code: 200,
            data: violationCategories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve violation categories",
            code: 500,
            error: error.message,
        });
    }
};

export const getViolationCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const violationCategoryData = await prisma.violation_category.findUnique({
            where: { id: parseInt(id) },
            include: {
                violation_type: true,
            },
        });

        if (!violationCategoryData) {
            res.status(404).json({
                success: false,
                message: "Violation category not found",
                code: 404,
            });
        }

        res.status(200).json({
            success: true,
            message: "Violation category retrivied successfully",
            code: 200,
            data: violationCategoryData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve violation category",
            code: 500,
            error: error.message,
        });
    }
};

export const createViolationCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const existingViolationCategory = await prisma.violation_category.findFirst({
            where: {
                name: {
                    contains: name,
                },
            },
        });

        if (existingViolationCategory) {
            return res.status(409).json({
                success: false,
                message: "Violation category already exists",
                code: 409,
            });
        }

         const newViolationCategory = await prisma.violation_category.create({
            data: {
                name,
            },
         });

         res.status(201).json({
            success: true,
            message: "Violation category created successfully",
            code: 201,
            data: newViolationCategory,
         });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create violation category",
            code: 500,
            error: error.message,
        });
    }
};

export const updateViolationCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const existingViolationCategory = await prisma.violation_category.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingViolationCategory) {
            res.status(404).json({
                success: false,
                message: "Violation category not found",
                code: 404,
            });
        }

        const updatedViolationCategory = await prisma.violation_category.update({
            where: { id: parseInt(id) },
            data: {
                name,
            },
        });

        res.status(200).json({
            success: true,
            message: "Violation category updated successfully",
            code: 200,
            data: updatedViolationCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update violation category",
            code: 500,
            error: error.message,
        });
    }
};

export const deleteViolationCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const existingViolationCategory = await prisma.violation_category.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingViolationCategory) {
            res.status(404).json({
                success: false,
                message: "Violation category not found",
                code: 404,
            });
        }

        const deletedViolationCategory = await prisma.violation_category.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({
            success: true,
            message: "Violation category deleted successfully",
            code: 200,
            data: deletedViolationCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete violation category",
            code: 500,
            error: error.message,
        });
    }
};