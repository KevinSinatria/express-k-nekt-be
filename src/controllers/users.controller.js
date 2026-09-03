import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import { paginate } from "../utils/paginate.js";
import xlsx from "xlsx";
import fs from "fs";

export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { fullname: { contains: search, mode: "insensitive" } },
            { nip: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    const result = await paginate(
      prisma.users,
      req,
      where,
      { created_at: "desc" },
      {
        id: true,
        username: true,
        fullname: true,
        nip: true,
        created_at: true,
        updated_at: true,
        user_roles: {
          select: {
            role: { select: { id: true, name: true } },
          },
        },
      },
      10,
    );
    const formatted = result.data.map((u) => ({
      id: u.id,
      username: u.username,
      fullname: u.fullname,
      nip: u.nip,
      created_at: u.created_at,
      updated_at: u.updated_at,
      roles: u.user_roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    }));
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      code: 200,
      data: formatted,
      meta: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      code: 500,
      error: error.message,
    });
  }
};

export const getAllUsersForExport = async (req, res) => {
  try {
    const search = req.query.search || "";
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { fullname: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    const users = await prisma.users.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        username: true,
        fullname: true,
        nip: true,
        created_at: true,
        user_roles: { select: { role: { select: { name: true } } } },
      },
    });
    const formatted = users.map((u) => ({
      id: u.id,
      username: u.username,
      fullname: u.fullname,
      nip: u.nip,
      roles: u.user_roles.map((ur) => ur.role.name).join(", "),
      created_at: u.created_at,
    }));
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      code: 200,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      code: 500,
      error: error.message,
    });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json({
      success: true,
      message: "Roles retrieved",
      code: 200,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve roles",
      code: 500,
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        fullname: true,
        nip: true,
        created_at: true,
        updated_at: true,
        user_roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: 404,
      });
    }

    const formatted = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      nip: user.nip,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.user_roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
      roleIds: user.user_roles.map((ur) => ur.role.id),
    };

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      code: 200,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      code: 500,
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  const { username, password, fullname, nip, roleIds } = req.body;
  try {
    const existingUser = await prisma.users.findFirst({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username sudah terdaftar",
        code: 409,
      });
    }

    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      const rolesCount = await prisma.roles.count({
        where: { id: { in: roleIds.map(Number) } },
      });
      if (rolesCount !== roleIds.length) {
        return res.status(400).json({
          success: false,
          message: "Salah satu role tidak ditemukan",
          code: 400,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        fullname: fullname || username,
        nip: nip || null,
        user_roles:
          roleIds && roleIds.length > 0
            ? { create: roleIds.map((r) => ({ role_id: Number(r) })) }
            : undefined,
      },
      select: { id: true, username: true, fullname: true, nip: true },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      code: 201,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      code: 500,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, fullname, nip, roleIds } = req.body;
  try {
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: 404,
      });
    }

    if (username && username !== existingUser.username) {
      const dup = await prisma.users.findFirst({ where: { username } });
      if (dup)
        return res.status(409).json({
          success: false,
          message: "Username sudah terdaftar",
          code: 409,
        });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (fullname !== undefined) updateData.fullname = fullname;
    if (nip !== undefined) updateData.nip = nip || null;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.users.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
      if (roleIds !== undefined && Array.isArray(roleIds)) {
        await tx.user_role.deleteMany({ where: { user_id: parseInt(id) } });
        if (roleIds.length > 0) {
          await tx.user_role.createMany({
            data: roleIds.map((r) => ({
              user_id: parseInt(id),
              role_id: Number(r),
            })),
          });
        }
      }
      return u;
    });

    const withRoles = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        fullname: true,
        nip: true,
        user_roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      code: 200,
      data: {
        id: withRoles.id,
        username: withRoles.username,
        fullname: withRoles.fullname,
        nip: withRoles.nip,
        roles: withRoles.user_roles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      code: 500,
      error: error.message,
    });
  }
};

export const importUsersFromExcel = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "File tidak ditemukan.", code: 400 });
  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    if (rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "File excel kosong.", code: 400 });

    const roleMap = new Map(
      (await prisma.roles.findMany({ select: { id: true, name: true } })).map(
        (r) => [r.name.toLowerCase(), r.id],
      ),
    );
    let created = 0;
    let skipped = 0;
    for (const row of rows) {
      const username = String(row["Username"] || row["username"] || "").trim();
      const password = String(row["Password"] || row["password"] || "").trim();
      const fullname = String(
        row["Nama Lengkap"] || row["Fullname"] || row["fullname"] || username,
      ).trim();
      const nip = row["NIP"] ? String(row["NIP"]).trim() : null;
      const rolesRaw = String(
        row["Roles"] || row["Role"] || row["roles"] || "",
      ).trim();
      if (!username || !password) {
        skipped++;
        continue;
      }
      const exists = await prisma.users.findFirst({ where: { username } });
      if (exists) {
        skipped++;
        continue;
      }
      const hashed = await bcrypt.hash(password, 10);
      const roleNames = rolesRaw
        ? rolesRaw
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        : [];
      const roleIds = roleNames.map((n) => roleMap.get(n)).filter(Boolean);
      await prisma.users.create({
        data: {
          username,
          password: hashed,
          fullname: fullname || username,
          nip,
          user_roles: roleIds.length
            ? { create: roleIds.map((id) => ({ role_id: id })) }
            : undefined,
        },
      });
      created++;
    }
    fs.unlinkSync(filePath);
    res.status(201).json({
      success: true,
      code: 201,
      message: `Impor sukses! ${created} user ditambahkan${skipped ? `, ${skipped} dilewati` : ""}.`,
    });
  } catch (err) {
    console.error(err);
    try {
      fs.unlinkSync(req.file.path);
    } catch {}
    res
      .status(500)
      .json({ success: false, message: "Gagal mengimpor data user." });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: 404,
      });
    }

    const deletedUser = await prisma.users.delete({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      code: 200,
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      code: 500,
      error: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    const userInfo = await prisma.users.findUnique({
      where: {
        username: user.username,
      },
      select: {
        password: true,
      },
    });

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userInfo.password,
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password",
        code: 401,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: {
        username: user.username,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      code: 200,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      code: 500,
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { fullname, username } = req.body;

    await prisma.users.update({
      where: {
        username: user.username,
      },
      data: {
        fullname,
        username,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      code: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      code: 500,
      error: error.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = req.user;
    const userInfo = await prisma.users.findUnique({
      where: {
        id: user.id,
      },
      select: {
        username,
        fullname,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully get user data",
      data: userInfo,
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
