import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllStudents = async (req, res) => {
	try {
		const studentsData = await paginate(
			prisma.detail_students,
			req,
			{
            OR: [
               {
                  students: {
                     name: {
                        contains: req.query.search,
                        mode: "insensitive",
                     },
                  },

               },
               {
                  classes: {
                     class: {
                        contains: req.query.search,
                        mode: "insensitive",
                     },
                  },
               }
            ],
         },
			{},
			{
				nis: true,
				students: {
					select: {
						name: true,
						point: true,
					},
				},
				classes: {
					select: {
						class: true,
					},
				},
			},
			10
		);

		const formattedStudentsData = studentsData.data.map((student) => ({
			nis: student.nis,
			name: student.students.name,
			point: student.students.point,
			class: student.classes.class,
		}));

		res.status(200).json({
			success: true,
			message: "Students data fetched successfully",
			code: 200,
			data: formattedStudentsData,
			meta: studentsData.pagination,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			code: 500,
		});
	}
};

export const createStudent = async (req, res) => {
	try {
		const { nis, name, point, year_id, class_id } = req.body;

		const newStudent = await prisma.students.create({
			data: {
				nis: Number(nis),
				name,
				point: Number(point),
				created_at: new Date(),
				updated_at: new Date(),
				detail_students: {
					create: {
						id_year: Number(year_id),
						id_class: Number(class_id),
					},
				},
			},
		});

		if (!newStudent) {
			return res.status(400).json({
				success: false,
				message: "Failed to create student",
				code: 400,
			});
		}

		res.status(201).json({
			success: true,
			message: "Student created successfully",
			code: 201,
		});
	} catch (error) {
		console.error(error);

		if (error.code === "P2002") {
			return res.status(409).json({
				success: false,
				message: "NIS already exists",
				code: 409,
			});
		}

		res.status(500).json({
			success: false,
			message: "Internal server error",
			code: 500,
		});
	}
};

export const getStudentByNIS = async (req, res) => {
	try {
		const { nis } = req.params;

		const studentData = await prisma.detail_students.findFirst({
			where: {
				nis: Number(nis),
			},
			select: {
				nis: true,
				students: {
					select: {
						name: true,
						point: true,
					},
				},
				classes: {
					select: {
						class: true,
					},
				},
			},
		});

		if (!studentData) {
			return res.status(404).json({
				success: false,
				message: "Student not found",
				code: 404,
			});
		}

		const formattedStudentData = {
			nis: studentData.nis,
			name: studentData.students.name,
			point: studentData.students.point,
			class: studentData.classes.class,
		};

		res.status(200).json({
			success: true,
			message: "Student data fetched successfully",
			code: 200,
			data: formattedStudentData,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			code: 500,
		});
	}
};

export const updateStudentByNIS = async (req, res) => {
	try {
		const { nis: nis_param } = req.params;
		const { name, point, year_id, class_id } = req.body;

		const updatedStudent = await prisma.students.update({
			where: {
				nis: Number(nis_param),
			},
			data: {
				name,
				point: Number(point),
				updated_at: new Date(),
				detail_students: {
					update: {
						where: {
							nis: Number(nis_param),
						},
						data: {
							id_year: Number(year_id),
							id_class: Number(class_id),
						},
					},
				},
			},
		});

		if (!updatedStudent) {
			return res.status(404).json({
				success: false,
				message: "Student not found",
				code: 404,
			});
		}

		res.status(200).json({
			success: true,
			message: "Student updated successfully",
			code: 200,
		});
	} catch (error) {
		console.error(error);

		if (error.code === "P2002") {
			return res.status(400).json({
				success: false,
				message: "NIS already exists",
				code: 400,
			});
		}

		res.status(500).json({
			success: false,
			message: "Internal server error",
			code: 500,
		});
	}
};

export const deleteStudentByNIS = async (req, res) => {
	try {
		const { nis } = req.params;

		const deletedStudent = await prisma.students.delete({
			where: {
				nis: Number(nis),
			},
		});

		res.status(200).json({
			success: true,
			message: "Student deleted successfully",
			code: 200,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			code: 500,
		});
	}
};
