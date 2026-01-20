import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.users.findUnique({
      where: {
        username,
      },
    });

    const userRoles = await prisma.user_role.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        code: 401,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        code: 401,
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        roles: userRoles.map((userRole) => userRole.role.name),
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        roles: userRoles.map((userRole) => userRole.role.name),
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

export const me = async (req, res) => {
  try {
    const user = req.user;
    const userInfo = await prisma.users.findUnique({
      where: {
        id: parseInt(user.id),
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        user_roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedUser = {
      id: userInfo.id,
      username: userInfo.username,
      fullname: userInfo.fullname,
      roles: userInfo.user_roles.map((userRole) => userRole.role.name),
    };

    res.status(200).json({
      success: true,
      message: "Successfully get user data",
      data: formattedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Internal server error",
    });
  }
};
