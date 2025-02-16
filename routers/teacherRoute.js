import { Router } from "express";
import {
    getStudentAllAttendenceExcelOneSubject,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { abstactAttendenceBySubject, getAttendenceBySubject, getAttendenceSummaryBySubjectIsExam, saveAttendenceByTeacher } from "../controllers/attendenceController.js";
import { getTeacherAdvisorClassroom, getAllClassroom, getClassroomByClassAndSubject } from "../controllers/classroomController.js";
import { getTeacherTimetable } from "../controllers/timetableController.js";
import { getActivityByTeacher, getActivity, paticipatedActivity } from "../controllers/activitiesController.js";
import { getAllAcademicTerms } from "../controllers/termController.js";

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
// getAttendenceSummaryBySubjectIsExam
// getClassroomByClassAndSubject
router.get('/terms', getAllAcademicTerms); // get terms 

router.get('/activities', getActivityByTeacher); // get activity by teacher
router.get('/activity/:uuid', getActivity); // get activity by UUID
router.post('/activity/:actId/participate', paticipatedActivity); // paticipated activity

router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;