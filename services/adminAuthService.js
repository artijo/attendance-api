import { comparePassword, hashPassword } from "../helper/bcrypt.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import { AppError } from "../utils/AppError.js";
import * as adminAuthRepository from "../repositories/adminAuthRepository.js";

export const login = async (username, password) => {
  const user = await adminAuthRepository.findAdminByUsername(username);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Invalid password");
  }
  const token = generateToken(
    { id: user.adminId, username: user.username },
    "1h"
  );
  const refreshToken = generateToken(
    { id: user.adminId, username: user.username },
    "7d"
  );
  return { token, refreshToken, user };
};

export const getTokenFromRefreshToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await adminAuthRepository.findAdminByUsername(decoded.username);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const token = generateToken(
    { id: user.id, username: user.username },
    "1h"
  );
  return { token };
};

export const checkAuth = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await adminAuthRepository.findAdminByUsername(decoded.username);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return { status: "logged in" };
};

export const changePassword = async (token, oldPassword, newPassword) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError(401, "Invalid token");
  }
  const user = await adminAuthRepository.findAdminByUsername(decoded.username);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const isPasswordMatch = await comparePassword(oldPassword, user.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Invalid password");
  }
  const hashedPassword = await hashPassword(newPassword);
  await adminAuthRepository.updateAdminPassword(decoded.username, hashedPassword);
  return { status: "success", message: "Password changed successfully" };
};
