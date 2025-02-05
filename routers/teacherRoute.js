import { Router } from "express";
import {
    getStudentAllAttendenceExcelOneSubject,

} from "../controllers/teacherController.js";
import { getSubjectByTeacher, getSubject } from "../controllers/subjectController.js";
import { getStuydingTimeById } from "../controllers/stuyingTimeController.js";
import { saveAttendenceByTeacher } from "../controllers/attendenceController.js";

const router = Router();

router.get('/subjects', getSubjectByTeacher); // get subject by teacher
router.get('/subject/:UUID', getSubject); // get subject by UUID
router.get('/studyTime/:UUID', getStuydingTimeById); // get study time by UUID
router.post('/attendance/bulk', saveAttendenceByTeacher); // save attendence


router.post('/exportsAttendence',getStudentAllAttendenceExcelOneSubject ); // export excel attendenc

export default router;