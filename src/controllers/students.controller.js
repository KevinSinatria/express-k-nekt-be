import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";
import xlsx from "xlsx";
import fs from "fs";

export const getAllStudents = async (req, res) => {
  const { year_id } = req.query;
  try {
    const studentsData = await paginate(
      prisma.detail_students,
      req,
      {
        AND: [
          {
            OR: [
              {
                student: {
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
              },
            ],
          },
          {
            id_year_period: {
              equals: Number(year_id),
            },
          },
        ],
      },
      {},
      {
        id: true,
        nis: true,
        student: {
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
        year_period: {
          select: {
            display_name: true,
          },
        },
      },
      10
    );

    const formattedStudentsData = studentsData.data.map((student) => ({
      id: student.id,
      nis: student.nis,
      name: student.student.name,
      point: student.student.point,
      class: student.classes.class,
      year_period: student.year_period.display_name,
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

export const getAllStudentsForExport = async (req, res) => {
  try {
    const { year_id } = req.query;
    const students = await prisma.detail_students.findMany({
      where: {
        id_year_period: Number(year_id),
      },
      select: {
        nis: true,
        student: {
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
        year_period: {
          select: {
            start_year: true,
            end_year: true,
          },
        },
      },
    });

    const formattedStudentsData = students.map((student) => ({
      nis: student.nis,
      name: student.student.name,
      point: student.student.point,
      class: student.classes.class,
      year_period: `${student.year_period.start_year}/${student.year_period.end_year}`,
    }));

    res.status(200).json({
      success: true,
      message: "Students data fetched successfully",
      code: 200,
      data: formattedStudentsData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: 500,
      error: {
        message: error.message,
      },
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { nis, name, point, year_id, class_id } = req.body;

    const newStudent = await prisma.students.create({
      data: {
        nis: nis,
        name,
        point: Number(point),
        created_at: new Date(),
        updated_at: new Date(),
        detail_students: {
          create: {
            id_year_period: Number(year_id),
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

export const importStudentsFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File tidak ditemukan.",
      code: 400,
    });
  }

  const yearPeriodId = Number(req.query.year_id);
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

    // --- Langkah Validasi Kelas yang Efisien ---
    const classNamesFromExcel = [
      ...new Set(dataFromExcel.map((row) => row["Kelas"]))
    ];

    const classesInDb = await prisma.classes.findMany({
      where: {
        class: { in: classNamesFromExcel },
      },
      select: { id: true, class: true },
    });

    // Buat lookup map agar pencarian id kelas super cepat
    const classMap = new Map(classesInDb.map((c) => [c.class, c.id]));

    // --- Langkah Persiapan Data ---
    const studentsToCreate = [];
    const detailsToCreate = [];

    for (const row of dataFromExcel) {
      const className = row["Kelas"];
      const classId = classMap.get(className);

      // Validasi: Lewati baris jika kolom wajib kosong atau kelas tidak ada di DB
      if (!row["NIS"] || !row["Nama Lengkap"] || !classId) {
        console.warn(
          `Data tidak valid atau kelas tidak ditemukan untuk NIS: ${row["NIS"]}. Baris dilewati.`
        );
        continue;
      }

      const nis = String(row["NIS"]);

      // Siapkan data untuk tabel 'students'
      studentsToCreate.push({
        nis: nis,
        name: row["Nama Lengkap"],
        point: Number(row["Poin Awal"]) || 0,
      });

      // Siapkan data untuk tabel 'detail_students'
      detailsToCreate.push({
        nis: nis,
        id_class: classId,
        id_year_period: yearPeriodId,
      });
    }

    if (studentsToCreate.length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada data valid yang bisa diimpor." });
    }

    // --- Langkah Eksekusi ke Database ---

    // 1. Bulk insert ke tabel students
    const createdStudentsResult = await prisma.students.createMany({
      data: studentsToCreate,
      skipDuplicates: true, // Jika ada NIS yang sama, lewati
    });

    // 2. Bulk insert ke tabel detail_students
    await prisma.detail_students.createMany({
      data: detailsToCreate,
      skipDuplicates: true, // Hindari duplikat jika siswa sudah terdaftar di kelas itu
    });

    // 3. Hapus file excel setelah selesai
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      code: 201,
      message: `Impor sukses! ${createdStudentsResult.count} siswa baru berhasil ditambahkan dan ditempatkan di kelas.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat mengimpor data." });
  }
};

export const promoteStudents = async (req, res) => {
  try {
    const { year_id } = req.query;
    const { class_id_to, nis } = req.body;

    if (!year_id || !class_id_to || !nis) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        code: 400,
      });
    }

    const newYearPeriodId = Number(year_id) + 1;

    const studentsData = nis.map((nis) => ({
      nis: nis,
      id_class: Number(class_id_to),
      id_year_period: newYearPeriodId,
    }));

    const studentsPromoted = await prisma.detail_students.createMany({
      data: studentsData,
      skipDuplicates: true,
    });

    if (!studentsPromoted) {
      return res.status(400).json({
        success: false,
        message: "Failed to promote students",
        code: 400,
      });
    }

    res.status(201).json({
      success: true,
      message: `Berhasil menaikkan kelas dari ${studentsPromoted.count} siswa!`,
      code: 201,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to promote students",
      code: 500,
      error: error.message,
    });
  }
};

export const getStudentByNIS = async (req, res) => {
  try {
    const { nis } = req.params;
    const { year_id } = req.query;

    const studentData = await prisma.detail_students.findFirst({
      where: {
        AND: [
          {
            student: {
              nis: nis,
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
        nis: true,
        student: {
          select: {
            name: true,
            point: true,
          },
        },
        classes: {
          select: {
            id: true,
            class: true,
          },
        },
        year_period: {
          select: {
            display_name: true,
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
      id: studentData.id,
      nis: studentData.nis,
      name: studentData.student.name,
      point: studentData.student.point,
      class: studentData.classes.class,
      class_id: studentData.classes.id,
      year_period: studentData.year_period.display_name,
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
        nis: nis_param,
      },
      data: {
        name,
        point: Number(point),
        updated_at: new Date(),
        detail_students: {
          updateMany: {
            where: {
              AND: [
                {
                  nis: nis_param,
                },
                {
                  id_year_period: Number(year_id),
                },
              ],
            },
            data: {
              id_year_period: Number(year_id),
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
        nis,
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
