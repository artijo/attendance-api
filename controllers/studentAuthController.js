import * as studentAuthService from "../services/studentAuthService.js";

export async function checkStudent(req, res) {
  const { studentId } = req.params;
  try {
    const result = await studentAuthService.checkStudent(studentId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal server error" });
  }
}

export async function LoginWithGoogle(req, res) {
  const { token, studentId } = req.body;
  try {
    const result = await studentAuthService.loginWithGoogle(token, studentId);
    return res.json(result);
  } catch (error) {
    console.error("Google auth error:", error);
    return res
      .status(error.statusCode || 401)
      .json({ error: error.message || "Invalid Google token" });
  }
}

export async function getTokenformRefreshToken(req, res) {
  let refreshToken = req.headers["authorization"].split(" ")[1];
  try {
    const result =
      await studentAuthService.getTokenFromRefreshToken(refreshToken);
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
    const result = await studentAuthService.checkAuth(token);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 401)
      .json({ err: error.message });
  }
}