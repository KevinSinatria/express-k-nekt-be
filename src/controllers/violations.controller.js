import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllViolations = async (req, res) => {
  try {
    const violationsData = await paginate(
      prisma.violations,
      req,
      {
        OR: [
          {
            detail_students: {
              students: {
                name: {
                  contains: req.query.search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            detail_students: {
              classes: {
                class: {
                  contains: req.query.search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            violation_type: {
              name: {
                contains: req.query.search,
                mode: "insensitive",
              },
            },
          },
          {
            users: {
              username: {
                contains: req.query.search,
                mode: "insensitive",
              },
            },
          },
          {
            violation_type: {
              violation_category: {
                name: {
                  contains: req.query.search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            violation_type: {
              punishment: {
                contains: req.query.search,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      {
        created_at: "desc",
      },
      {
        id: true,
        detail_students: {
          select: {
            nis: true,
            students: {
              select: {
                name: true,
              },
            },
            classes: {
              select: {
                class: true,
              },
            },
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
      nis: violation.detail_students.nis,
      name: violation.detail_students.students.name,
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

export const createViolation = async (req, res) => {
  try {
    const { student_id, violation_type_id, teacher_id, implemented } = req.body;
    const newViolation = await prisma.violations.create({
      data: {
        student_id,
        type_id: violation_type_id,
        teacher_id,
        implemented,
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
            nis: true,
            students: {
              select: {
                name: true,
              },
            },
            classes: {
              select: {
                class: true,
              },
            },
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
    });

    const formattedViolationData = {
      id: violation.id,
      nis: violation.detail_students.nis,
      name: violation.detail_students.students.name,
      class: violation.detail_students.classes.class,
      violation_name: violation.violation_type.name,
      punishment_point: violation.violation_type.point,
      punishment: violation.violation_type.punishment,
      violation_category: violation.violation_type.violation_category.name,
      implemented: violation.implemented,
      teacher: violation.users.username,
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

export const updateViolationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, violation_type_id, teacher_id } = req.body;

    const updatedViolation = await prisma.violations.update({
      where: {
        id: Number(id),
      },
      data: {
        student_id,
        type_id: violation_type_id,
        teacher_id,
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
