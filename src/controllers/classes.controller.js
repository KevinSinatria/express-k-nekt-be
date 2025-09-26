import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllClasses = async (req, res) => {
  try {
    console.log(req.query);
    const classes = await paginate(
      prisma.classes,
      req,
      {
        class: {
          contains: req.query.search,
          mode: "insensitive",
        },
      },
      {
        class: "asc",
      },
      {
        id: true,
        class: true,
      },
      10
    );

    res.status(200).json({
      success: true,
      message: "Classes retrivied successfully",
      code: 200,
      data: classes.data,
      meta: classes.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve classes",
      code: 500,
    });
  }
};

export const getClassById = async (req, res) => {
  const { id: classId } = req.params;
  const { year_id } = req.query;

  const id = parseInt(classId);
  const yearId = parseInt(year_id);

  if (isNaN(id) || isNaN(yearId)) {
    res.status(400).json({
      success: false,
      message: "Invalid class id or year id",
      code: 400,
    });
  }
  try {
    const classData = await prisma.classes.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        class: true,
        detail_students: {
          where: {
            id_year_period: {
              equals: yearId,
            },
          },
          select: {
            id: true,
            nis: true,
            student: {
              select: {
                name: true,
                point: true,
              },
            },
            year_period: {
              select: {
                display_name: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      res.status(404).json({
        success: false,
        message: "Class not found",
        code: 404,
      });
    }

    const formattedClassData = {
      id: classData.id,
      class: classData.class,
      students: classData.detail_students.map((student) => ({
        id: student.id,
        nis: student.nis,
        name: student.student.name,
        point: student.student.point,
        year_period: student.year_period.display_name,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Class retrivied successfully",
      code: 200,
      data: formattedClassData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve class",
      code: 500,
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      code: 500,
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update class",
      code: 500,
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
