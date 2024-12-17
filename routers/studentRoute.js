import { Router } from "express";
import {
    createStudent,getAllStudent,
    updateStudent,getStudent
} from "../controllers/studentController.js";

const router = Router();

// router.get('/ping', (req, res) => {
//     res.json({ message: 'pong' });
// });
router.get('/student/:uuid', getStudent)
router.get('/students', getAllStudent); // route สำหรับเรียกใช้ funtion ดึงนักเรียนทั้งหมดแบบไม่สนใจ
router.post('/student', createStudent); // route สำหรับเรียกใช้ function สร้างรายชื่อนักเรียน
router.put('/student',updateStudent); // route สำหรับ แก้ไขรายบุคคลของนักเรียน



export default router;