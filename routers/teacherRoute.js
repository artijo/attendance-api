import { Router } from "express";
import {
    createTeacher,
    getAllTeacher,
    updateTeacher,
    getStudentAllAttendenceExcelOneSubject

} from "../controllers/teacherController.js";

const router = Router();

router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher', updateTeacher); // แก้ไขข้อมูล teacher


router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;