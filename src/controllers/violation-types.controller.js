import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllViolationTypes = async (req, res) => {
	try {
		const violationTypes = await paginate(
			prisma.violation_type,
			req,
			{
				OR: [
					{
						name: {
							contains: req.query.search,
							mode: "insensitive",
						},
					},
					{
						violation_category: {
							name: {
								contains: req.query.search,
								mode: "insensitive",
							},
						},
					},
				],
			},
			{},
			{
				id: true,
				name: true,
				point: true,
				violation_category: {
					select: {
						name: true,
					},
				},
				punishment: true,
			},
			10
		);

		//    prisma.violation_type.findMany({
		//       include: {
		//           violation_category: {
		//               select: {
		//                   name: true,
		//               },
		//           },
		//       },
		//   });

		const formattedData = violationTypes.data.map((type) => ({
			id: type.id,
			name: type.name,
			point: type.point,
			category: type.violation_category.name,
			punishment: type.punishment,
		}));

		res.status(200).json({
			success: true,
			message: "Violation types retrivied successfully",
			code: 200,
			data: formattedData,
			meta: violationTypes.pagination,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to retrieve violation types",
			code: 500,
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
				code: 404,
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
			code: 200,
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
				name: {
					contains: name,
				},
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
			code: 201,
			data: newViolationType,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to create violation type",
			code: 500,
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
			res.status(404).json({
				success: false,
				message: "Violation type not found",
				code: 404,
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
			code: 200,
			data: updatedViolationType,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to update violation type",
			code: 500,
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
			res.status(404).json({
				success: false,
				message: "Violation type not found",
				code: 404,
			});
		}

		const deletedViolationType = await prisma.violation_type.delete({
			where: { id: parseInt(id) },
		});
		res.status(200).json({
			success: true,
			message: "Violation type deleted successfully",
			code: 200,
			data: deletedViolationType,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to delete violation type",
			code: 500,
			error: error.message,
		});
	}
};
