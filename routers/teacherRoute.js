import { Router } from "express";
import {
    getStudentAllAttendenceExcelOneSubject,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { abstactAttendenceBySubject, saveAttendenceByTeacher } from "../controllers/attendenceController.js";
import { getTeacherAdvisorClassroom } from "../controllers/classroomController.js";
import { getTeacherTimetable } from "../controllers/timetableController.js";

const router = Router();

router.get('/subjects', getSubjectByTeacher); // get subject by teacher
router.get('/subject/:UUID', getSubject); // get subject by UUID
router.get('/studyTime/:UUID', getStuydingTimeById); // get study time by UUID
router.get('/timetable/teacher/:subjectId', getTeacherTimetable);
router.post('/attendance/bulk', saveAttendenceByTeacher); // save attendence

router.get('/classrooms', getTeacherAdvisorClassroom); //get list room study
router.get('/classrooms/:classId/:stdId', abstactAttendenceBySubject);



router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;