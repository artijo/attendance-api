import { Router } from "express";
import multer from "multer";
import { uploadS3 } from "../libs/multer.js";
const router = Router();

import {
    getTimeTable,
    getTimetableRoleStudent
} from "../controllers/timetableController.js";
import { getAllLeaveRequestsByStudentId, getAllLeaveRequestsType, getStudingTimeByDate, CreateLeaveRequest, getLeaveRequestById, cancelLeaveRequest } from "../controllers/leaverequestController.js";
import { studentAttendenceEnrollment, saveAttendenceByLeader } from "../controllers/attendenceController.js";
import { getClassroomBystdId, getClassroomMembersByClassroomId, getTimeTableandStudytimeByClassId, getStuydingTimeById } from "../controllers/leaderController.js";

// ประวัติการเข้าเรียน
router.get('/timetable', getTimetableRoleStudent);

// นักเรียนลงชื่อเข้าเรียน
router.post('/attendence/enrollment', studentAttendenceEnrollment);


// ลา
router.get('/leave', getAllLeaveRequestsByStudentId); // ประวัติการลา
router.get('/leaveType', getAllLeaveRequestsType); // ประเภทการลา
router.get('/studingTime/:date', getStudingTimeByDate); // เวลาเรียนในวันนั้นๆ
router.post('/leave',uploadS3.single('leaveFile') ,CreateLeaveRequest); // สร้างการลา
router.get('/leave/:id', getLeaveRequestById); // ประวัติการลา
router.delete('/leave/:id', cancelLeaveRequest); // ยกเลิกการลา

// leader
router.get('/leader/classrooms', getClassroomBystdId); // ห้องเรียนของนักเรียน
router.get('/leader/classrooms/:classId/members', getClassroomMembersByClassroomId); // สมาชิกในห้องเรียน
router.get('/leader/classrooms/:classId/timetable', getTimeTableandStudytimeByClassId); // ตารางเรียนของห้องเรียน
router.get('/leader/studytime/:studingTimeId', getStuydingTimeById); // ตารางเรียนของห้องเรียน
router.post('/leader/attendance/bulk', saveAttendenceByLeader); // บันทึกการเข้าเรียนของหัวหน้าห้อง

export default router;