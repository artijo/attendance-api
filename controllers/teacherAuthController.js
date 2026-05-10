import * as teacherAuthService from "../services/teacherAuthService.js";

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await teacherAuthService.login(email, password);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message });
  }
}

export async function getTokenformRefreshToken(req, res) {
  let refreshToken = req.headers["authorization"].split(" ")[1];
  try {
    const result =
      await teacherAuthService.getTokenFromRefreshToken(refreshToken);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 401)
      .json({ status: "error", message: error.message || "Invalid token" });
  }
}

export async function checkAuth(req, res) {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    const result = await teacherAuthService.checkAuth(token);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 401)
      .json({ err: error.message });
  }
}

export const newLogin = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await teacherAuthService.newLogin(email);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "ไม่พบบัญชีนี้ในระบบ" });
  }
};

export const newPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await teacherAuthService.newPassword(token, password);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
  }
};