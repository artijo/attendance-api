import { Router } from "express";

import { login, checkAuth, getTokenformRefreshToken } from "../controllers/adminAuthController.js";
import {
    createStudent,getAllStudent,
    updateStudent, getStudent
 } from "../controllers/studentController.js";
import {
    createTeacher, getAllTeacher,
    updateTeacher, getTeacher
} from "../controllers/teacherController.js";

import { featchDataForSeachbar } from "../controllers/adminController.js";

const router = Router();

router.post('/auth/login', login);
router.get('/auth/check', checkAuth);
router.post('/auth/refresh', getTokenformRefreshToken);

// students Management
router.get('/student/:uuid', getStudent)
router.get('/students', getAllStudent);
router.post('/student', createStudent);
router.put('/student',updateStudent);

// teacher Management
router.get('/teacher/:uuid', getTeacher); // ดึงข้อมูล teacher
router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher', updateTeacher); // แก้ไขข้อมูล teacher


router.get('/search', featchDataForSeachbar); 


export default router;