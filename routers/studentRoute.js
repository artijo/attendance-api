import { Router } from "express";

const router = Router();

import {
    studentAttendenceSubject,
} from "../controllers/attendenceController.js";

import {
    getTimeTable
} from "../controllers/timetableController.js";

// router.get('/ping', (req, res) => {
//     res.json({ message: 'pong' });
// });

// router.get('/studentTerm/:stdId', getStudentClassroomTerm)
// router.get('/student/:classroomId/:studentId', attendenceBySubjectAndStuId)
// ลงชื่อเข้าเรียน 
router.get('/studentTimetable/:classroomId/:dayOfWeek', getTimeTable); // เอาไว้ดึงข้อมูลเพื่อเช็คว่าเริ่มเรียนตอนนไหน
router.post('/attendenceSubject' , studentAttendenceSubject);

export default router;