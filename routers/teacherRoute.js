import { Router } from "express";
import {
    createTeacher,
    getAllTeacher,
    updateTeacher,
    getStudentAllAttendenceExcelOneSubject,
    getTeacher

} from "../controllers/teacherController.js";

const router = Router();


router.get('/teacher/:uuid', getTeacher); // ดึงข้อมูล teacher
router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher', updateTeacher); // แก้ไขข้อมูล teacher


router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;