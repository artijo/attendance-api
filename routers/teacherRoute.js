import { Router } from "express";
import {
    createTeacher,
    getAllTeacher,
    updateTeacher

} from "../controllers/teacherController.js";

const router = Router();

router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher', updateTeacher); // แก้ไขข้อมูล teacher

export default router;