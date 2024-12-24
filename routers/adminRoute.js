import { Router } from "express";

import { login, checkAuth, getTokenformRefreshToken } from "../controllers/adminAuthController.js";
import {
    createStudent,getAllStudent,
    updateStudent, getStudent,
    createStudentWithFile
 } from "../controllers/studentController.js";
import {
    createTeacher, getAllTeacher,
    updateTeacher, getTeacher
} from "../controllers/teacherController.js";
import { createClassroom, getAllClassroom, getClassroom, getAllClassroomType, updateClassroom } from "../controllers/classroomController.js";
import { getAllLeaders } from "../controllers/leaderController.js";

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
router.post('/students/bulk', createStudentWithFile);

// teacher Management
router.get('/teacher/:uuid', getTeacher); // ดึงข้อมูล teacher
router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher', updateTeacher); // แก้ไขข้อมูล teacher

// classroom Management
router.get('/classrooms', getAllClassroom); // ดึงข้อมูลทั้งหมด classroom
router.post('/classroom', createClassroom); // สร้าง classroom
router.put('/classroom', updateClassroom); // แก้ไขข้อมูล classroom
router.get('/classroom/:uuid', getClassroom); // ดึงข้อมูล classroom
router.get('/classrooms/types', getAllClassroomType); // ดึงข้อมูลประเภทของห้องเรียน

// leader Management
router.get('/leaders', getAllLeaders); // ดึงข้อมูลทั้งหมด leader

router.get('/search', featchDataForSeachbar); 



export default router;