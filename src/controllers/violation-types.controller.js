import prisma from "../models/prisma.js";

export const getAllViolationTypes = async (req, res) => {
    try {
        const violationTypes = await prisma.violation_type.findMany({
            include: {
                violation_category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const formattedData = violationTypes.map(type => ({
            id: type.id,
            name: type.name,
            point: type.point,
            category: type.violation_category.name,
            punishment: type.punishment,
        }));

        res.status(200).json({
            success: true,
            message: "Violation types retrivied successfully",
            data: formattedData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve violation types",
            error: error.message,
        });
    }
};

export const getViolationTypesById = async (req, res) => {
    const { id } = req.params;
    try {
        const violationTypeData = await prisma.violation_type.findUnique({
            where: { id: parseInt(id) },
            include: {
                violation_category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!violationTypeData) {
            res.status(404).json({
                success: false,
                message: "Violation type not found",
            });
        }

        const formattedData = {
            id: violationTypeData.id,
            name: violationTypeData.name,
            point: violationTypeData.point,
            category: violationTypeData.violation_category.name,
            punishment: violationTypeData.punishment,
        };

        res.status(200).json({
            success: true,
            message: "Violation type retrivied successfully",
            data: formattedData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve violation type",
            error: error.message,
        });
    }
};

export const createViolationType = async (req, res) => {
    const { name, point, category_id, punishment } = req.body;
    try {
        const existingViolationType = await prisma.violation_type.findFirst({
            where: {
                name: name,
            },
        });

        if (existingViolationType) {
            return res.status(409).json({
                success: false,
                message: "Violation type already exists",
                code: 409,
            });
        }

         const newViolationType = await prisma.violation_type.create({
            data: {
                name,
                point,
                category_id,
                punishment,
            },
         });

         res.status(201).json({
            success: true,
            message: "Violation type created successfully",
            data: newViolationType,
         });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create violation type",
            error: error.message,
        });
    }
};

export const updateViolationType = async (req, res) => {
    const { id } = req.params;
    const { name, point, category_id, punishment } = req.body;
    try {
        const existingViolationType = await prisma.violation_type.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingViolationType) {
            res.status(401).json({
                success: false,
                message: "Violation type not found",
            });
        }

        const updatedViolationType = await prisma.violation_type.update({
            where: { id: parseInt(id) },
            data: {
                name,
                point,
                category_id,
                punishment,
            },
        });
        res.status(200).json({
            success: true,
            message: "Violation type updated successfully",
            data: updatedViolationType,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update violation type",
            error: error.message,
        });
    }
};

export const deleteViolationType = async (req, res) => {
    const { id } = req.params;
    try {
        const existingViolationType = await prisma.violation_type.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingViolationType) {
            res.status(401).json({
                success: false,
                message: "Violation type not found",
            });
        }

        const deletedViolationType = await prisma.violation_type.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            success: true,
            message: "Violation type deleted successfully",
            data: deletedViolationType,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete violation type",
            error: error.message,
        });
    }
};