import { Router } from "express";
import multer from "multer";
import { uploadS3 } from "../libs/multer.js";
const router = Router();

import {
    getTimeTable,
    getTimetableRoleStudent
} from "../controllers/timetableController.js";
import { getAllLeaveRequestsByStudentId, getAllLeaveRequestsType, getStudingTimeByDate, CreateLeaveRequest, getLeaveRequestById, cancelLeaveRequest } from "../controllers/leaverequestController.js";
import { studentAttendenceEnrollment, saveAttendenceByLeader, saveAttendenceByStudentWithQR, isEnrollment, summarzieAttendenceByDateStudent, summarzieAttendenceBySubject } from "../controllers/attendenceController.js";
import { getClassroomBystdId, getClassroomMembersByClassroomId, getTimeTableandStudytimeByClassId, getStuydingTimeById } from "../controllers/leaderController.js";
import { getTermByStudent } from "../controllers/termController.js";
import { getSubjectByStudent } from "../controllers/subjectController.js";
import { saveActivityByStudentWithQR, getActivityByLeader, getActivity, paticipatedActivityByLeader, getActivityStudent, activityCheckIn, isActivityThisTimeCheckIn, activityHistoryStudent } from "../controllers/activitiesController.js";


//timetable 
router.get('/timetable', getTimetableRoleStudent);

// นักเรียนลงชื่อเข้าเรียน
router.post('/attendence/isEnrollment', isEnrollment);
router.post('/attendence/enrollment', studentAttendenceEnrollment);
router.post('/attendance/qr', saveAttendenceByStudentWithQR); // บันทึกการเข้าเรียนด้วย QR Code

//ประวัติการเข้าเรียน
router.get('/attendence/history/:termId/:date', summarzieAttendenceByDateStudent);
router.get('/attendecne/subjectlist/:termId', getSubjectByStudent);
router.get('/attendence/history/subjectdetail/:termId/:subjectId', summarzieAttendenceBySubject);

//เทอม
router.get('/term', getTermByStudent);

//กิจกรรม

router.get('/activity', getActivityStudent);
router.get('/activity/isCheckin/:activityId', isActivityThisTimeCheckIn);
router.get('/activity/hitory/:activityId',activityHistoryStudent);
router.post('/activity', activityCheckIn);

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
router.get('/leader/activities', getActivityByLeader); // กิจกรรมที่หัวหน้าห้องต้องทำ
router.get('/leader/activity/:uuid', getActivity); // กิจกรรมที่หัวหน้าห้องต้องทำ
router.post('/leader/activity/:actId/participate', paticipatedActivityByLeader); // หัวหน้าห้องเข้าร่วมกิจกรรม

// กิจกรรม
router.post('/activity/join/qr', saveActivityByStudentWithQR);

export default router;