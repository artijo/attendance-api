import { Router } from "express";
import {
    getStudentAllAttendenceExcelOneSubject,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { abstactAttendenceBySubject, saveAttendenceByTeacher } from "../controllers/attendenceController.js";
import { getTeacherAdvisorClassroom, getAllClassroom } from "../controllers/classroomController.js";
import { getTeacherTimetable } from "../controllers/timetableController.js";
import { getActivityByTeacher, getActivity } from "../controllers/activitiesController.js";

const router = Router();

router.get('/subjects', getSubjectByTeacher); // get subject by teacher
router.get('/subject/:UUID', getSubject); // get subject by UUID
router.get('/studyTime/:UUID', getStuydingTimeById); // get study time by UUID

router.post('/timetable/teacher', getTeacherTimetable);
router.post('/attendance/bulk', saveAttendenceByTeacher); // save attendence

router.get('/classrooms', getTeacherAdvisorClassroom); //get list room study
router.get('/classrooms/all', getAllClassroom); //get list room study
router.get('/classrooms/:classId/:stdId', abstactAttendenceBySubject);

router.get('/activities', getActivityByTeacher); // get activity by teacher
router.get('/activity/:uuid', getActivity); // get activity by UUID

router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;