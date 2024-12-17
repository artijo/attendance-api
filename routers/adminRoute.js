import { Router } from "express";

import { login, checkAuth, getTokenformRefreshToken } from "../controllers/adminAuthController.js";
import {
    createStudent,getAllStudent,
    updateStudent
 } from "../controllers/studentController.js";

import { featchDataForSeachbar } from "../controllers/adminController.js";

const router = Router();

router.post('/auth/login', login);
router.get('/auth/check', checkAuth);
router.post('/auth/refresh', getTokenformRefreshToken);

// students Management
router.get('/students', getAllStudent);
router.post('/student', createStudent);
router.put('/student',updateStudent);


router.get('/search', featchDataForSeachbar); 


export default router;