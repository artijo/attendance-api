import * as adminAuthService from "../services/adminAuthService.js";

export async function login(req, res) {
  const { username, password } = req.body;
  try {
    const result = await adminAuthService.login(username, password);
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
    const result = await adminAuthService.getTokenFromRefreshToken(refreshToken);
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
    const result = await adminAuthService.checkAuth(token);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 401)
      .json({ message: error.message });
  }
}

export async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    const result = await adminAuthService.changePassword(
      token,
      oldPassword,
      newPassword
    );
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 401)
      .json({ message: error.message });
  }
}