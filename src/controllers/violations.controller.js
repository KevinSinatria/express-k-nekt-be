import e from "express";
import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllViolations = async (req, res) => {
  try {
    const {
      search,
      year_id,
      timePreset,
      classId,
      categoryId,
      teacherId,
      status,
    } = req.query;
    const where = {};

    // --- Kondisi untuk Search (menggunakan OR) ---
    if (search) {
      where.OR = [
        {
          detail_students: {
            student: { name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          detail_students: {
            classes: { class: { contains: search, mode: "insensitive" } },
          },
        },
        { violation_type: { name: { contains: search, mode: "insensitive" } } },
        { users: { username: { contains: search, mode: "insensitive" } } },
      ];
    }

    // --- Kondisi untuk Filter Waktu ---
    if (timePreset && timePreset !== "all") {
      const now = new Date();
      let fromDate;
      switch (timePreset) {
        case "today":
          fromDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "last_7_days":
          fromDate = new Date(new Date().setDate(now.getDate() - 7));
          break;
        case "last_30_days":
          fromDate = new Date(new Date().setDate(now.getDate() - 30));
          break;
        case "this_month":
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "this_year":
          fromDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      if (fromDate) {
        where.created_at = { gte: fromDate };
      }
    }

    // --- Kondisi untuk Filter Dropdown ---
    if (year_id && year_id !== "all") {
      where.detail_students = {
        ...where.detail_students,
        id_year_period: parseInt(year_id),
      };
    }
    if (classId && classId !== "all") {
      where.detail_students = {
        ...where.detail_students,
        id_class: parseInt(classId),
      };
    }
    if (categoryId && categoryId !== "all") {
      where.violation_type = {
        ...where.violation_type,
        category_id: parseInt(categoryId),
      };
    }
    if (teacherId && teacherId !== "all") {
      where.teacher_id = parseInt(teacherId);
    }
    if (status && status !== "all") {
      where.implemented = status === "true" ? true : false;
    }

    const violationsData = await paginate(
      prisma.violations,
      req,
      where,
      {
        created_at: "desc",
      },
      {
        id: true,
        detail_students: {
          select: {
            classes: {
              select: {
                class: true,
              },
            },
          },
        },
        student: {
          select: {
            nis: true,
            name: true,
          },
        },
        violation_type: {
          select: {
            name: true,
            point: true,
            punishment: true,
            violation_category: {
              select: {
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            username: true,
          },
        },
        implemented: true,
        created_at: true,
        updated_at: true,
      },
      10
    );

    const formattedViolationsData = violationsData.data.map((violation) => ({
      id: violation.id,
      nis: violation.student.nis,
      name: violation.student.name,
      class: violation.detail_students.classes.class,
      violation_name: violation.violation_type.name,
      punishment_point: violation.violation_type.point,
      punishment: violation.violation_type.punishment,
      violation_category: violation.violation_type.violation_category.name,
      implemented: violation.implemented,
      teacher: violation.users.username,
      created_at: violation.created_at,
      updated_at: violation.updated_at,
    }));

    res.status(200).json({
      success: true,
      message: "Get all violations successfully",
      code: 200,
      data: formattedViolationsData,
      meta: violationsData.pagination,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAllViolationsForExport = async (req, res) => {
  try {
    const violations = await prisma.violations.findMany({
      select: {
        id: true,
        detail_students: {
          select: {
            nis: true,
            classes: {
              select: {
                class: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
          },
        },
        violation_type: {
          select: {
            name: true,
            point: true,
            punishment: true,
            violation_category: {
              select: {
                name: true,
              },
            },
          },
        },
        implemented: true,
        users: {
          select: {
            username: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    const formattedViolations = violations.map((violation) => ({
      id: violation.id,
      nis: violation.detail_students.nis,
      name: violation.student.name,
      class: violation.detail_students.classes.class,
      violation_name: violation.violation_type.name,
      punishment_point: violation.violation_type.point,
      punishment: violation.violation_type.punishment,
      violation_category: violation.violation_type.violation_category.name,
      implemented: violation.implemented,
      teacher: violation.users.username,
      created_at: violation.created_at,
      updated_at: violation.updated_at,
    }));

    res.status(200).json({
      success: true,
      message: "Get all violations successfully",
      code: 200,
      data: formattedViolations,
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

export const createViolation = async (req, res) => {
  try {
    const { student_id, violation_type_id, teacher_id, implemented, nis } =
      req.body;

    const punishmentPoint = await prisma.violation_type.findUnique({
      where: {
        id: Number(violation_type_id),
      },
      select: {
        point: true,
      },
    });

    // const pointsNow = await prisma.violations.findMany({
    //   where: {
    //     nis: nis,
    //   },
    //   select: {
    //     violation_type: {
    //       select: {
    //         point: true,
    //       },
    //     },
    //   },
    // });

    const pointsNowFromStudentData = await prisma.students.findUnique({
      where: {
        nis: nis,
      },
      select: {
        point: true,
      },
    });
    const pointsNow = pointsNowFromStudentData.point;

    // const totalPointsNowInViolations = pointsNow.reduce((total, point) => {
    //   return total + point.violation_type.point;
    // }, 0);

    // if (pointsNowFromStudentData && totalPointsNowInViolations === 0) {
    //   pointsInit = pointsNowFromStudentData.point;
    // } else {
    //   pointsInit = 0;
    // }

    // const totalPointsNow = pointsNow.reduce((total, point) => {
    //   return total + point.violation_type.point;
    // }, pointsInit);

    const totalPoint = pointsNow + punishmentPoint.point;

    await prisma.students.update({
      where: {
        nis: nis,
      },
      data: {
        point: totalPoint,
      },
    });

    const newViolation = await prisma.violations.create({
      data: {
        student_id,
        type_id: violation_type_id,
        teacher_id,
        implemented,
        nis,
      },
    });

    if (!newViolation) {
      return res.status(400).json({
        success: false,
        message: "Failed to create violation",
        code: 400,
      });
    }

    res.status(201).json({
      success: true,
      message: "Violation created successfully",
      code: 201,
      totalPoints: totalPoint,
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

export const getViolationById = async (req, res) => {
  try {
    const { id } = req.params;
    const violation = await prisma.violations.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        detail_students: {
          select: {
            id: true,
            classes: {
              select: {
                class: true,
              },
            },
          },
        },
        student: {
          select: {
            nis: true,
            name: true,
          },
        },
        violation_type: {
          select: {
            id: true,
            name: true,
            point: true,
            punishment: true,
            violation_category: {
              select: {
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            username: true,
          },
        },
        implemented: true,
        created_at: true,
        updated_at: true,
      },
    });

    const formattedViolationData = {
      id: violation.id,
      nis: violation.student.nis,
      name: violation.student.name,
      student_id: violation.detail_students.id,
      class: violation.detail_students.classes.class,
      violation_type_id: violation.violation_type.id,
      violation_name: violation.violation_type.name,
      punishment_point: violation.violation_type.point,
      punishment: violation.violation_type.punishment,
      violation_category: violation.violation_type.violation_category.name,
      implemented: violation.implemented,
      teacher: violation.users.username,
      teacher_id: violation.users.id,
      created_at: violation.created_at,
      updated_at: violation.updated_at,
    };

    res.status(200).json({
      success: true,
      message: "Get violation by id successfully",
      code: 200,
      data: formattedViolationData,
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

export const getFilterDataForm = async (req, res) => {
  try {
    const classes = await prisma.classes.findMany({
      select: {
        id: true,
        class: true,
      },
    });

    const categories = await prisma.violation_category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const teachers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Get filter data form successfully",
      code: 200,
      data: {
        classes,
        categories,
        teachers,
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

export const updateViolationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, violation_type_id, teacher_id, nis } = req.body;

    const punishmentPointFromDB = await prisma.violations.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        violation_type: {
          select: {
            point: true,
          },
        },
      },
    });
    const punishmentPointFrom = punishmentPointFromDB.violation_type.point;
    const punishmentPointToDB = await prisma.violation_type.findUnique({
      where: {
        id: Number(violation_type_id),
      },
      select: {
        point: true,
      },
    });
    const punishmentPointTo = punishmentPointToDB.point;
    const currentPunismentPointStudentDB = await prisma.students.findUnique({
      where: {
        nis: nis,
      },
      select: {
        point: true,
      },
    });
    const currentPunismentPointStudent = currentPunismentPointStudentDB.point;

    const totalPunishmentPoint =
      currentPunismentPointStudent - punishmentPointFrom + punishmentPointTo;
    await prisma.students.update({
      where: {
        nis: nis,
      },
      data: {
        point: totalPunishmentPoint,
      },
    });

    const updatedViolation = await prisma.violations.update({
      where: {
        id: Number(id),
      },
      data: {
        student_id,
        type_id: violation_type_id,
        teacher_id,
        nis: nis,
      },
    });

    if (!updatedViolation) {
      return res.status(404).json({
        success: false,
        message: "Violation not found",
        code: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Violation updated successfully",
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

export const deleteViolationById = async (req, res) => {
  try {
    const { id } = req.params;
    const punishmentPointDB = await prisma.violations.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        violation_type: {
          select: {
            point: true,
          },
        },
        nis: true,
      },
    });

    if (!punishmentPointDB) {
      return res.status(404).json({
        success: false,
        message: "Violation not found",
        code: 404,
      });
    }

    const punishmentPoint = punishmentPointDB.violation_type.point;
    const currentPunismentPointStudentDB = await prisma.students.findUnique({
      where: {
        nis: punishmentPointDB.nis,
      },
      select: {
        point: true,
      },
    });
    const currentPunismentPointStudent = currentPunismentPointStudentDB.point;

    const totalPunishmentPoint = currentPunismentPointStudent - punishmentPoint;
    await prisma.students.update({
      where: {
        nis: punishmentPointDB.nis,
      },
      data: {
        point: totalPunishmentPoint,
      },
    });

    const deletedViolation = await prisma.violations.delete({
      where: {
        id: Number(id),
      },
    });

    if (!deletedViolation) {
      return res.status(404).json({
        success: false,
        message: "Violation not found",
        code: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Violation deleted successfully",
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

export const implementViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedViolation = await prisma.violations.update({
      where: {
        id: Number(id),
      },
      data: {
        implemented: true,
      },
    });

    if (!updatedViolation) {
      return res.status(404).json({
        success: false,
        message: "Violation not found",
        code: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Violation implemented successfully",
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

export const unimplementViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedViolation = await prisma.violations.update({
      where: {
        id: Number(id),
      },
      data: {
        implemented: false,
      },
    });

    if (!updatedViolation) {
      return res.status(404).json({
        success: false,
        message: "Violation not found",
        code: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Violation unimplemented successfully",
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
