import { comparePassword, hashPassword } from "../helper/bcrypt.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/resend.js";
import { AppError } from "../utils/AppError.js";
import * as teacherAuthRepository from "../repositories/teacherAuthRepository.js";

export const login = async (email, password) => {
  const user = await teacherAuthRepository.findTeacherByEmail(email);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Invalid password");
  }
  const token = generateToken({ id: user.tchId, email: user.email }, "1h");
  const refreshToken = generateToken(
    { id: user.tchId, email: user.email },
    "7d"
  );
  return { token, refreshToken, user };
};

export const getTokenFromRefreshToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await teacherAuthRepository.findTeacherByEmail(decoded.email);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const token = generateToken(
    { id: user.tchId, email: user.email },
    "1h"
  );
  return { token };
};

export const checkAuth = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await teacherAuthRepository.findTeacherByEmail(decoded.email);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return { status: "logged in" };
};

export const newLogin = async (email) => {
  const teacher = await teacherAuthRepository.findTeacherByFirst(email);
  if (!teacher) {
    throw new AppError(500, "ไม่พบบัญชีนี้ในระบบ");
  }
  if (!teacher.password) {
    const token = jwt.sign({ id: teacher.tchId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await sendEmail(
      email,
      "[ระบบบันทึกและติดตามการเข้าเรียนและกิจกรรมของนักเรียน] สร้างรหัสผ่านครั้งแรก",
      `สำหรับตั้งรหัสผ่านครั้งแรก กรุณาคลิกที่ลิงก์นี้ <a href="${process.env.TEACHER_WEB_CLIENT}/new-password/?tk=${token}">เพื่อตั้งรหัสผ่านครั้งแรก</a>`
    );
    return {
      massage:
        "ระบบได้ส่งอีเมลสำหรับสร้างรหัสผ่านครั้งแรกแล้ว กรุณาตรวจสอบอีเมลของคุณ สามารถใช้งานได้เฉพาะ 1 ชั่วโมง",
    };
  } else if (teacher.password) {
    throw new AppError(401, "บัญชีนี้ถูกตั้งรหัสผ่านแล้ว");
  } else {
    throw new AppError(404, "ไม่พบบัญชีนี้ในระบบ");
  }
};

export const newPassword = async (token, password) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const hashedPassword = await hashPassword(password);
  await teacherAuthRepository.updateTeacherById(decoded.id, {
    password: hashedPassword,
  });
  return { message: "เปลี่ยนรหัสผ่านสำเร็จ" };
};
