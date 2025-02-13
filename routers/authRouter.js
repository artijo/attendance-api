import { Router } from "express";
import { 
    login as adminLogin, 
    checkAuth as adminCheckAuth, 
    getTokenformRefreshToken as adminGetTokenFromRefreshToken
} from "../controllers/adminAuthController.js";
import { 
    login as teacherLogin, 
    checkAuth as teacherCheckAuth, 
    getTokenformRefreshToken as teacherGetTokenFromRefreshToken 
} from "../controllers/teacherAuthController.js";

const router = Router();

// Admin Authentication
router.post('/a/login', adminLogin);
router.get('/a/check', adminCheckAuth);
router.post('/a/refresh', adminGetTokenFromRefreshToken);

// Teacher Authentication
router.post('/t/login', teacherLogin);
router.get('/t/check', teacherCheckAuth);
router.post('/t/refresh', teacherGetTokenFromRefreshToken);

export default router;