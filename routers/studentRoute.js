import { Router } from "express";

const router = Router();

import {
    studentAttendenceSubject,
    attendanceHistorySearchByTermAndSubjectId, 
    getAllStudentClassroomTerm,
    getSubjectTimetableByClassroom
} from "../controllers/attendenceController.js";

import {
    getTimeTable
} from "../controllers/timetableController.js";
import { getAllLeaveRequestsByStudentId } from "../controllers/leaverequestController.js";

// ประวัติการเข้าเรียน
router.get('/attendenceHistory', attendanceHistorySearchByTermAndSubjectId);
router.get('/studentClassroom', getAllStudentClassroomTerm);
router.get('/getSubject', getSubjectTimetableByClassroom);

// ลงชื่อเข้าเรียน 
router.get('/studentTimetable/:classroomId/:dayOfWeek', getTimeTable); // เอาไว้ดึงข้อมูลเพื่อเช็คว่าเริ่มเรียนตอนนไหน
router.post('/attendenceSubject' , studentAttendenceSubject); // ลงชื่อเข้าเรียน

// ลา
router.get('/leave', getAllLeaveRequestsByStudentId); // ประวัติการลา

export default router;