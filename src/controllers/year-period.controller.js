import prisma from "../models/prisma.js";
import { paginate } from "../utils/paginate.js";

export const getAllYearPeriods = async (req, res) => {
  try {
    const yearPeriods = await paginate(
      prisma.year_period,
      req,
      {
        OR: [
          {
            start_year: {
              lt: new Date().getFullYear(),
            },
          },
          {
            start_year: {
              equals: new Date().getFullYear(),
            },
          },
        ],
      },
      {
        start_year: "desc",
      },
      {
        id: true,
        start_year: true,
        end_year: true,
        display_name: true,
      },
      10
    );

    res.status(200).json({
      success: true,
      message: "Year periods fetched successfully",
      code: 200,
      data: yearPeriods.data,
      meta: yearPeriods.pagination,
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

export const createYearPeriod = async (req, res) => {
  try {
    const { year } = req.body;

    const newYearPeriod = await prisma.year_period.create({
      data: {
        start_year: year,
        end_year: year + 1,
        display_name: `Tahun Ajaran ${year}/${year + 1}`,
      },
    });

    res.status(201).json({
      success: true,
      message: "Year period created successfully",
      code: 201,
      data: newYearPeriod,
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

export const deleteYearPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedYearPeriod = await prisma.year_period.delete({
      where: {
        id: Number(id),
      },
    });

    if (!deletedYearPeriod) {
      return res.status(404).json({
        success: false,
        message: "Year period not found",
        code: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Year period deleted successfully",
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
