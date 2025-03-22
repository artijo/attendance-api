import { Router } from "express";
import {
    getStudentAllAttendenceExcelOneSubject,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { abstactAttendenceBySubject, getAttendenceByDateAndStudnet, getAttendenceBySubject, getAttendenceSummaryBySubjectIsExam, saveAttendenceByTeacher } from "../controllers/attendenceController.js";
import { getTeacherAdvisorClassroom, getAllClassroom, getClassroomByClassAndSubject } from "../controllers/classroomController.js";
import { getTeacherTimetable } from "../controllers/timetableController.js";
import { getActivityByTeacher, getActivity, paticipatedActivityByteacher } from "../controllers/activitiesController.js";
import { getAllAcademicTerms, getTermDateBetweenFilterHolidays } from "../controllers/termController.js";
import { getHolidayList } from "../controllers/holidayController.js";

const router = Router();

router.get('/subjects', getSubjectByTeacher); // get subject by teacher
router.get('/subject/:UUID', getSubject); // get subject by UUID
router.get('/studyTime/:UUID', getStuydingTimeById); // get study time by UUID

router.post('/timetable/teacher', getTeacherTimetable);
router.post('/attendance/bulk', saveAttendenceByTeacher); // save attendence

router.get('/classrooms', getTeacherAdvisorClassroom); //get list room study
router.get('/classrooms/all', getAllClassroom); //get list room study
router.get('/classrooms/:classId/:stdId', abstactAttendenceBySubject);
router.get('/classrooms/check/:termId/:subjectId', getClassroomByClassAndSubject);
router.get('/classrooms/classrooms/checkdetail/:subjectId/:classroomId', getAttendenceSummaryBySubjectIsExam);
router.get('/attendence/:subjectId/:classroomId', getAttendenceBySubject);
router.post('/attendence/byday',getAttendenceByDateAndStudnet)
// getAttendenceSummaryBySubjectIsExam
// getClassroomByClassAndSubject

router.get('/terms', getAllAcademicTerms); // get terms 
router.get('/term/:termId', getTermDateBetweenFilterHolidays);



router.get('/activities', getActivityByTeacher); // get activity by teacher
router.get('/activity/:uuid', getActivity); // get activity by UUID
router.post('/activity/:actId/participate', paticipatedActivityByteacher); // paticipated activity

router.get('/holiday/:termId', getHolidayList);

export default router;