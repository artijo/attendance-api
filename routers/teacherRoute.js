import { Router } from "express";
import {
    getTeacherInfo,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { abstactAttendenceBySubject, getAttendenceByDateAndStudnet, getAttendenceBySubject, getAttendenceSummaryBySubjectIsExam, saveAttendenceByTeacher, generateLinkAttendanceForQR, getAttendenceByDate } from "../controllers/attendenceController.js";
import { getTeacherAdvisorClassroom, getAllClassroom, getClassroomByClassAndSubject } from "../controllers/classroomController.js";
import { getActivityByTeacher, getActivity, paticipatedActivityByteacher, abstactActivityFilterByRoom, abstactActivityClassroom, generateLinkActivityForQR } from "../controllers/activitiesController.js";
import { getAllAcademicTerms, getTermDateBetweenFilterHolidays } from "../controllers/termController.js";
import { getHolidayList } from "../controllers/holidayController.js";
import { getLeaveRequestForTeacher, getLeaveRequestForTeacherByleaveRequestStudingTimeId, teacherUpdateStatusLeaveRequest } from "../controllers/leaverequestController.js";

const router = Router();

router.get('/teacher-info', getTeacherInfo); // get teacher info by uuid

router.get('/subjects', getSubjectByTeacher); // get subject by teacher
router.get('/subject/:UUID', getSubject); // get subject by UUID
router.get('/studyTime/:UUID', getStuydingTimeById); // get study time by UUID')

router.post('/attendance/bulk', saveAttendenceByTeacher); // save attendence

router.get('/classrooms', getTeacherAdvisorClassroom); //get list room study
router.get('/classrooms/all', getAllClassroom); //get list room study
router.get('/classrooms/:classId/:stdId', abstactAttendenceBySubject);
router.get('/classrooms/check/:termId/:subjectId', getClassroomByClassAndSubject);
router.get('/classrooms/classrooms/checkdetail/:subjectId/:classroomId', getAttendenceSummaryBySubjectIsExam);

router.get('/attendence/:subjectId/:classroomId', getAttendenceBySubject);
router.post('/attendence/byday',getAttendenceByDateAndStudnet)
router.post('/attendance/generate-qr', generateLinkAttendanceForQR); // generate link for QR code
router.get("/attendence/byDate/:date/:classroomId", getAttendenceByDate);
// getAttendenceSummaryBySubjectIsExam
// getClassroomByClassAndSubject

router.get('/terms', getAllAcademicTerms); // get terms 
router.get('/term/:termId', getTermDateBetweenFilterHolidays);



router.get('/activities', getActivityByTeacher); // get activity by teacher
router.get('/activity/:uuid', getActivity); // get activity by UUID
router.post('/activity/:actId/participate', paticipatedActivityByteacher); // paticipated activity
router.get('/activity/abstact/byclassroom/:activityId/:classId',abstactActivityClassroom);
router.get('/activity/abstact/:activityId',abstactActivityFilterByRoom);
router.post('/activity/generate-qr', generateLinkActivityForQR); // generate link for QR code
router.get('/holiday/:termId', getHolidayList);

router.get('/leave-requests', getLeaveRequestForTeacher); // get leave request for teacher
router.get('/leave-requests/:id', getLeaveRequestForTeacherByleaveRequestStudingTimeId); // get leave request for teacher by studing time id
router.put('/leave-requests/studingtime/:id', teacherUpdateStatusLeaveRequest); // update leave request for teacher

export default router;