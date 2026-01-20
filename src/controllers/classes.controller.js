import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";
import xlsx from "xlsx";
import fs from "fs";
import roman from "roman-numerals";

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

export const getNextClassesPromote = async (req, res) => {
  try {
    const { year_id, nis } = req.query;
    const classByStudent = await prisma.detail_students.findFirst({
      where: {
        AND: [
          {
            student: {
              nis,
            },
          },
          {
            id_year_period: {
              equals: Number(year_id),
            },
          },
        ],
      },
      select: {
        classes: {
          select: {
            class: true,
          },
        },
      },
    });

    if (!classByStudent) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
        code: 404,
      });
    }

    const className = classByStudent.classes.class;
    const classGrade = className.split(" ")[0];
    const classInNumber = roman.toArabic(classGrade);
    const nextClassGrade = roman.toRoman(classInNumber + 1);

    const nextClasses = await prisma.classes.findMany({
      where: {
        class: {
          startsWith: nextClassGrade + " ",
        },
      },
      select: {
        id: true,
        class: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Classes retrivied successfully",
      code: 200,
      data: nextClasses,
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
          orderBy: {
            student: {
              name: "asc",
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

export const importClassesFromExcel = async (req, res) => {
  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const dataFromExcel = xlsx.utils.sheet_to_json(sheet);

    if (dataFromExcel.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File excel kosong.",
        code: 400,
      });
    }

    const classNamesFromExcel = [
      ...new Set(
        dataFromExcel
          .map((row) => row["Kelas"])
          .filter((className) => className)
      ),
    ];

    const classesInDb = await prisma.classes.findMany({
      where: {
        class: { in: classNamesFromExcel },
      },
      select: { id: true, class: true },
    });

    const classMap = new Map(classesInDb.map((c) => [c.class, c.id]));

    const classesToCreate = classNamesFromExcel
      .filter((className) => !classMap.has(className))
      .map((className) => ({ class: String(className).toUpperCase() }));

    if (classesToCreate.length > 0) {
      await prisma.classes.createMany({
        data: classesToCreate,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Semua kelas sudah ada di database.",
        code: 400,
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Impor sukses! ${classesToCreate.length} kelas baru telah ditambahkan.`,
      code: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to import classes",
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
