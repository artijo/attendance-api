import { generateToken, verifyToken } from "../helper/jwt.js";
import { sensorName } from "../helper/helper.js";
import { AppError } from "../utils/AppError.js";
import * as studentAuthRepository from "../repositories/studentAuthRepository.js";
import axios from "axios";

export const checkStudent = async (studentId) => {
  const student = await studentAuthRepository.findStudentById(studentId);
  if (!student) {
    throw new AppError(404, "Student not found");
  }
  const studentName = student.fName + " " + sensorName(student.lName);
  return {
    googleId: student.googleId,
    studentId: student.stdId,
    studentName,
  };
};

export const loginWithGoogle = async (token, studentId) => {
  // ตรวจสอบ id_token กับ Google
  const response = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
  );
  const { sub: google_id, name, email } = response.data;

  // เช็คว่าผู้ใช้มีในระบบหรือยัง
  let student = await studentAuthRepository.findStudentById(studentId);
  if (!student.googleId) {
    // ถ้ายังไม่มี ให้สร้างผู้ใช้ใหม่
    student = await studentAuthRepository.updateStudentGoogleId(
      studentId,
      google_id,
      email
    );
  }
  if (student.googleId !== google_id) {
    throw new AppError(401, "Google ID mismatch");
  }

  // isLeader?
  const isLeader = await studentAuthRepository.findLeaderByStdId(student.stdId);

  // สร้าง JWT
  const jwtToken = generateToken({ id: student.stdId, google_id }, "1h");
  const refreshToken = generateToken({ id: student.stdId, google_id }, "7d");
  return {
    jwtToken,
    studentId: student.stdId,
    refreshToken,
    fName: student.fName,
    lName: student.lName,
    email: student.email,
    tel: student.tel,
    isLeader,
  };
};

export const getTokenFromRefreshToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await studentAuthRepository.findStudentById(decoded.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const token = generateToken(
    { id: user.stdId, google_id: user.googleId },
    "1h"
  );
  return { token };
};

export const checkAuth = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await studentAuthRepository.findStudentById(decoded.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return { status: "logged in" };
};
