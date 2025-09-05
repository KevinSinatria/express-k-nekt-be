import { Prisma } from "@prisma/client";
import prisma from "../models/prisma.js";

export const getStatsOverview = async (req, res) => {
	try {
		// Overview Cards
		const totalStudents = await prisma.students.count();
		const totalClasses = await prisma.classes.count();
		const totalViolations = await prisma.violations.count();
		const unimplementViolation = await prisma.violations.count({
			where: { implemented: false },
		});
		const violationsWithPoints = await prisma.violations.findMany({
			select: {
				violation_type: {
					select: {
						point: true,
					},
				},
			},
		});
		const totalPoints = violationsWithPoints.reduce((acc, violation) => {
			return acc + violation.violation_type.point;
		}, 0);
		const averagePoints = totalPoints / totalViolations;

		// Chart Data
		// Violation By Category
		const violationsGroupedByType = await prisma.violations.groupBy({
			by: ["type_id"],
			_count: {
				_all: true,
			},
		});
		const typesAndCategories = await prisma.violation_type.findMany({
			where: {
				id: {
					in: violationsGroupedByType.map((item) => item.type_id),
				},
			},
			select: {
				id: true,
				violation_category: {
					select: {
						name: true,
					},
				},
			},
		});
		const violationByCategoryData = violationsGroupedByType.map((group) => {
			const matchingType = typesAndCategories.find(
				(type) => type.id === group.type_id
			);
			return {
				name: matchingType.violation_category.name,
				value: group._count._all,
			};
		});

		const combinedViolationByCategoryData = violationByCategoryData.reduce(
			(acc, currentItem) => {
				const existingItem = acc.find((item) => item.name === currentItem.name);
				if (existingItem) {
					existingItem.value += currentItem.value;
				} else {
					acc.push(currentItem);
				}
				return acc;
			},
			[]
		);

		// Top Student By Points
		const topStudentByPoints = await prisma.students.findMany({
			select: {
				name: true,
				nis: true,
				point: true,
			},
			orderBy: {
				point: "desc",
			},
			take: 5,
		});

		// Violations By Month
		const violationsByMonth = await prisma.$queryRaw(Prisma.sql`
            SELECT
               DATE_FORMAT(created_at, '%Y-%m') as month,
               COUNT(*) as count
            FROM violations
            GROUP BY month
            ORDER BY month;
         `);
      const violationsByMonthData = violationsByMonth.map((item) => ({
         month: item.month,
         count: Number(item.count),
      }));

		res.status(200).json({
			success: true,
			message: "Stats overview retrieved successfully",
			code: 200,
			data: {
				cards: {
					totalStudents,
					totalClasses,
					totalViolations,
					unimplementViolation,
					averagePoints,
				},
				chart: {
					violationByCategoryData: combinedViolationByCategoryData,
					topStudentByPoints,
					violationsByMonthData,
				},
			},
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
