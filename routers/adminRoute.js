import { Router } from "express";

import { login, checkAuth, getTokenformRefreshToken } from "../controllers/adminAuthController.js";
import {
    createStudent,getAllStudent,
    updateStudent, getStudent,
    createStudentWithFile, getStudentwithoutClassroom
 } from "../controllers/studentController.js";
import {
    createTeacher, getAllTeacher,
    updateTeacher, getTeacher, getAllDepartment, createDepartment, getDepartment, updateDepartment, deleteDepartment
} from "../controllers/teacherController.js";
import { getAcademicYearClassroom,createClassroom, getAllClassroom, getClassroom, getAllClassroomType, updateClassroom, createClassroomType, createClassroomMember, deleteClassroomMember, deleteClassroomType, updateClassroomType } from "../controllers/classroomController.js";
import { getAllLeaders } from "../controllers/leaderController.js";

import { featchDataForSeachbar } from "../controllers/adminController.js";
import { getTimeTableByRoom, deleteTimetable, createTimetable } from "../controllers/timetableController.js";
import { getSubject,getAllSubject, getAllSubjectType, createSubject, editSubject, createSubjectType, deleteSubejectType, editSubjectType} from "../controllers/subjectController.js";
import { getHoliday, createStuingCalendar,createHoliday, getHolidayCalendar, getStudyCalendar, getHolidayCalendarList, deleteHoliday } from "../controllers/stuyingTimeController.js";

const router = Router();

router.post('/auth/login', login);
router.get('/auth/check', checkAuth);
router.post('/auth/refresh', getTokenformRefreshToken);

// students Management
router.get('/student/:uuid', getStudent)
router.get('/students', getAllStudent);
router.post('/student', createStudent);
router.put('/student',updateStudent);
router.post('/students/bulk', createStudentWithFile);
router.get('/students/withoutClassroom', getStudentwithoutClassroom);

// teacher Management
router.get('/teacher/:uuid', getTeacher); // ดึงข้อมูล teacher
router.get('/teachers', getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.post('/teacher', createTeacher); // สร้าง teacher
router.put('/teacher/:uuid', updateTeacher); // แก้ไขข้อมูล teacher
router.get('/departments', getAllDepartment); // ดึงข้อมูลทั้งหมด department
router.post('/department', createDepartment); // สร้าง department
router.get('/department/:uuid', getDepartment); // ดึงข้อมูล department
router.put('/department/:uuid', updateDepartment); // แก้ไขข้อมูล department
router.delete('/department/:uuid', deleteDepartment); // ลบข้อมูล department

// classroom Management
router.get('/classrooms', getAllClassroom); // ดึงข้อมูลทั้งหมด classroom
router.post('/classroom', createClassroom); // สร้าง classroom
router.put('/classroom', updateClassroom); // แก้ไขข้อมูล classroom
router.get('/classroom/:uuid', getClassroom); // ดึงข้อมูล classroom
router.get('/classrooms/types', getAllClassroomType); // ดึงข้อมูลประเภทของห้องเรียน
router.post('/classroom/type', createClassroomType); // สร้างประเภทห้องเรียน
router.put('/classroom/type/:uuid', updateClassroomType); // แก้ไขประเภทห้องเรียน
router.delete('/classroom/type/:uuid', deleteClassroomType); // ลบประเภทห้องเรียน
router.post('/classroom/member', createClassroomMember); // เพิ่มสมาชิกห้องเรียน
router.delete('/classroom/member/:uuid', deleteClassroomMember); // ลบสมาชิกห้องเรียน
router.get('/termAndAcademicYear', getAcademicYearClassroom); // List เทอมและ ปีการศึกษา

// leader Management
router.get('/leaders', getAllLeaders); // ดึงข้อมูลทั้งหมด leader

router.get('/search', featchDataForSeachbar); 
// timetable Management
router.get('/timetableR', getTimeTableByRoom);
router.post('/timetable', createTimetable);
router.delete('/timetable/:timetableId', deleteTimetable);
// subject Management
router.get('/subject/:UUID', getSubject);
router.get('/subjects', getAllSubject);
router.post('/subject', createSubject);
router.put('/subject/:UUID', editSubject);
router.get('/subjects/type', getAllSubjectType);
router.post('/subject/type', createSubjectType);
router.put('/subject/type/:uuid', editSubjectType);
router.delete('/subject/type/:uuid', deleteSubejectType);

//stuyingTime Management

router.get('/holiday', getHoliday); // get holiday ราชการ
router.post('/holiday', createHoliday); //สร้างวันหยุด 

router.get('/holidayCalendar', getHolidayCalendar); //ดึงวันหยุดของแต่ละห้อง 
router.get('/calendarStudy', getStudyCalendar)

router.post('/calendar', createStuingCalendar); //สร้างตารางเรียน 
router.post('/holidayList', getHolidayCalendarList);
router.delete('/holiday', deleteHoliday);

export default router;
