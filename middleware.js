import { verifyToken } from "./helper/jwt.js";

export function isAuth(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    token = token.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired" });
  }
}
