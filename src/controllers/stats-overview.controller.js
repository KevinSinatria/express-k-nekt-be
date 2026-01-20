import { Prisma } from "@prisma/client";
import prisma from "../models/prisma.js";

export const getStatsOverview = async (req, res) => {
  try {
    const { year_period_id } = req.query;
    // ========== 🧾 OVERVIEW CARDS ==========
    const [totalStudents, totalClasses, totalViolations, unimplementViolation] =
      await Promise.all([
        prisma.students.count(),
        prisma.classes.count(),
        prisma.violations.count(),
        prisma.violations.count({ where: { implemented: false } }),
      ]);

    // Total poin pelanggaran
    const violationsWithPoints = await prisma.violations.findMany({
      select: {
        violation_type: { select: { point: true } },
      },
    });
    const totalPoints = violationsWithPoints.reduce(
      (acc, v) => acc + v.violation_type.point,
      0
    );
    const averagePoints =
      totalViolations > 0 ? totalPoints / totalViolations : 0;

    // Pelanggaran berat (misal poin > 10)
    const seriousViolations = await prisma.violations.count({
      where: { violation_type: { point: { gt: 10 } } },
    });

    // Guru pelapor aktif bulan ini
    const activeReporters = await prisma.violations.groupBy({
      by: ["teacher_id"],
      where: {
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _count: true,
    });
    const totalActiveTeachers = activeReporters.length;

    // Siswa tanpa pelanggaran
    const studentsWithViolation = await prisma.violations.findMany({
      distinct: ["nis"],
      select: { nis: true },
    });
    const cleanStudents = totalStudents - studentsWithViolation.length;

    // Tahun ajaran aktif
    const activeYear = await prisma.year_period.findFirst({
      where: {
        id: {
          equals: Number(year_period_id),
        },
      },
      select: { display_name: true },
    });

    // Tingkat kedisiplinan sekolah (0 - 100%)
    const maxPoint = 100; // asumsi ambang batas poin maksimal per siswa
    const disciplineRate = Number(
      (100 - (totalPoints / (totalStudents * maxPoint)) * 100).toFixed(2)
    );

    // ========== 📊 CHARTS ==========
    // Pelanggaran berdasarkan kategori
    const violationsGroupedByType = await prisma.violations.groupBy({
      by: ["type_id"],
      _count: { _all: true },
    });
    const typesAndCategories = await prisma.violation_type.findMany({
      where: {
        id: { in: violationsGroupedByType.map((v) => v.type_id) },
      },
      select: {
        id: true,
        violation_category: { select: { name: true } },
      },
    });
    const violationByCategoryData = violationsGroupedByType.map((group) => {
      const matched = typesAndCategories.find((t) => t.id === group.type_id);
      return {
        name: matched?.violation_category.name || "Tidak Diketahui",
        value: group._count._all,
      };
    });

    // Gabungkan kategori yang sama
    const combinedViolationByCategoryData = violationByCategoryData.reduce(
      (acc, current) => {
        const existing = acc.find((i) => i.name === current.name);
        if (existing) existing.value += current.value;
        else acc.push(current);
        return acc;
      },
      []
    );

    // Top siswa dengan poin tertinggi
    const topStudentByPoints = await prisma.students.findMany({
      select: {
        name: true,
        nis: true,
        point: true,
        detail_students: {
          where: { id_year_period: Number(year_period_id) },
          select: {
            classes: {
              select: {
                class: true,
              },
            },
          },
        },
      },
      orderBy: { point: "desc" },
      take: 5,
    });

    // Top kelas dengan pelanggaran terbanyak
    const topClassesRaw = await prisma.$queryRaw(Prisma.sql`
			SELECT c.class AS name, COUNT(v.id) AS count
			FROM violations v
			JOIN detail_students ds ON ds.id = v.student_id
			JOIN classes c ON c.id = ds.id_class
			GROUP BY c.class
			ORDER BY count DESC
			LIMIT 5;
		`);
    const topClasses = topClassesRaw.map((item) => ({
      name: item.name,
      value: Number(item.count),
    }));

    // Pelanggaran per bulan (trending)
    const violationsByMonth = await prisma.$queryRaw(Prisma.sql`
			SELECT
				TO_CHAR(created_at, 'YYYY-MM') as month,
				COUNT(*) as count
			FROM violations
			GROUP BY month
			ORDER BY month;
		`);
    const violationsByMonthData = violationsByMonth.map((item) => ({
      month: item.month,
      count: Number(item.count),
    }));

    // ========== 🧩 FINAL RESPONSE ==========
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
          seriousViolations,
          totalActiveTeachers,
          cleanStudents,
          activeYear:
            activeYear?.display_name || "Tahun Ajaran Tidak Ditemukan",
          averagePoints: Number(averagePoints.toFixed(2)),
          disciplineRate,
        },
        charts: {
          violationByCategoryData: combinedViolationByCategoryData,
          topStudentByPoints: topStudentByPoints.map((student) => ({
            name: student.name,
            nis: student.nis,
            point: student.point,
            class: student.detail_students[0].classes.class,
          })),
          topClasses,
          violationsByMonthData,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getStatsOverview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: 500,
    });
  }
};
