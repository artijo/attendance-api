import { Router } from "express";
import { 
    login, 
    checkAuth, 
    getTokenformRefreshToken 
} from "../controllers/adminAuthController.js";
import { 
    login as teacherLogin, 
    checkAuth as teacherCheckAuth, 
    getTokenformRefreshToken as teacherGetTokenFromRefreshToken ,
    newLogin as teacherNewLogin,
    newPassword as teacherNewPassword
} from "../controllers/teacherAuthController.js";

const router = Router();

// Admin Authentication
router.post('/a/login', login);
router.get('/a/check', checkAuth);
router.post('/a/refresh', getTokenformRefreshToken);

// Teacher Authentication
router.post('/t/login', teacherLogin);
router.get('/t/check', teacherCheckAuth);
router.post('/t/refresh', teacherGetTokenFromRefreshToken);
router.post('/t/new-login', teacherNewLogin);
router.post('/t/set-password', teacherNewPassword);

export default router;