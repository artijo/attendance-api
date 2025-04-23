import { Router } from "express";
import multer from "multer";

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
import { getAllLeaveRequestsByStudentId, getAllLeaveRequestsType, getStudingTimeByDate, CreateLeaveRequest, getLeaveRequestById } from "../controllers/leaverequestController.js";

// ประวัติการเข้าเรียน
router.get('/attendenceHistory', attendanceHistorySearchByTermAndSubjectId);
router.get('/studentClassroom', getAllStudentClassroomTerm);
router.get('/getSubject', getSubjectTimetableByClassroom);

// ลงชื่อเข้าเรียน 
router.get('/studentTimetable/:classroomId/:dayOfWeek', getTimeTable); // เอาไว้ดึงข้อมูลเพื่อเช็คว่าเริ่มเรียนตอนนไหน
router.post('/attendenceSubject' , studentAttendenceSubject); // ลงชื่อเข้าเรียน

// ลา
router.get('/leave', getAllLeaveRequestsByStudentId); // ประวัติการลา
router.get('/leaveType', getAllLeaveRequestsType); // ประเภทการลา
router.get('/studingTime/:date', getStudingTimeByDate); // เวลาเรียนในวันนั้นๆ
router.post('/leave',multer().none() ,CreateLeaveRequest); // สร้างการลา
router.get('/leave/:id', getLeaveRequestById); // ประวัติการลา

export default router;