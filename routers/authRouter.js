import { Router } from "express";
import {
  login,
  checkAuth,
  getTokenformRefreshToken,
  changePassword,
} from "../controllers/adminAuthController.js";
import {
  login as teacherLogin,
  checkAuth as teacherCheckAuth,
  getTokenformRefreshToken as teacherGetTokenFromRefreshToken,
  newLogin as teacherNewLogin,
  newPassword as teacherNewPassword,
} from "../controllers/teacherAuthController.js";

import {
  checkStudent,
  LoginWithGoogle,
  checkAuth as studentCheckAuth,
  getTokenformRefreshToken as studentGetTokenFromRefreshToken,
} from "../controllers/studentAuthController.js";

const router = Router();

// Admin Authentication
router.post("/a/login", login);
router.get("/a/check", checkAuth);
router.post("/a/refresh", getTokenformRefreshToken);
router.post("/a/change-password", changePassword);

// Teacher Authentication
router.post("/t/login", teacherLogin);
router.get("/t/check", teacherCheckAuth);
router.post("/t/refresh", teacherGetTokenFromRefreshToken);
router.post("/t/new-login", teacherNewLogin);
router.post("/t/set-password", teacherNewPassword);

// Student Authentication
router.get("/s/check/:studentId", checkStudent);
router.post("/s/google", LoginWithGoogle);
router.get("/s/check", studentCheckAuth);
router.post("/s/refresh", studentGetTokenFromRefreshToken);

export default router;
