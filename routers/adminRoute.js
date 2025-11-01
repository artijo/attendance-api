import { Router } from "express";

import {
  createStudent,
  getAllStudent,
  updateStudent,
  getStudent,
  createStudentWithFile,
  getStudentwithoutClassroom,
  getStudentforaddmemberinclassroom,
  getSoftDeletedStudents,
  restoreSoftDeletedStudent,
  softDeleteStudent,
} from "../controllers/studentController.js";
import {
  createTeacher,
  getAllTeacher,
  updateTeacher,
  getTeacher,
  getAllDepartment,
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  getSoftDeletedTeachers,
  restoreTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import {
  getAcademicYearClassroom,
  createClassroom,
  getAllClassroom,
  getClassroom,
  getAllClassroomType,
  updateClassroom,
  createClassroomType,
  createClassroomMember,
  deleteClassroomMember,
  deleteClassroomType,
  updateClassroomType,
  updateClassroomMember,
  getClassroomByAcademicYearTerm,
  getClassroomFilterByAcademicYearAndLevel,
  softDeleteClassroom,
  getDeletedClassrooms,
  restoreClassroom,
} from "../controllers/classroomController.js";
import { getAllLeaders } from "../controllers/leaderController.js";

import { featchDataForSeachbar } from "../controllers/adminController.js";
import {
  getTimeTableByRoom,
  deleteTimetable,
  createTimetable,
  getSubjectTimetable,
  createTimetableByAddSubject,
  createTimetableBySwitchPeriod,
  createTimetableBySwitchSubjectAndSubject,
  editTimelateTimetable,
} from "../controllers/timetableController.js";
import {
  getSubject,
  getAllSubject,
  getAllSubjectType,
  createSubject,
  editSubject,
  createSubjectType,
  deleteSubejectType,
  editSubjectType,
  softDeleteSubject,
  restoreSubject,
  getSoftDeletedSubjects,
} from "../controllers/subjectController.js";
// import { getHoliday, createStuingCalendar,createHoliday, getHolidayCalendar, getStudyCalendar, getHolidayCalendarList, deleteHoliday ,updateHoliday} from "../controllers/stuyingTimeController.js";
import {
  getAllAcademicTerms,
  createTerm,
  deleteTerm,
  getOneAcademicTerm,
  updateTerm,
  getTermDateBetweenFilterHolidays,
} from "../controllers/termController.js";
import {
  getHolidayListAuto,
  createHoliday,
  getHolidayList,
  deleteHoliday,
  getOneHoliday,
  updateHoliday,
  fullCalendarHoliday,
} from "../controllers/holidayController.js";
import { getFullCalendarStudyTime } from "../controllers/stuyingTimeController.js";
import {
  getAllActivitiesByType,
  getActivity,
  getActivityType,
  createActivity,
  editActivity,
  abstactActivityClassroom,
  abstactActivityFilterByRoom,
  generateLinkActivityForQR,
  softDeleteActivity,
  getsoftDeletedActivity,
  restoreSoftDeletedActivity,
} from "../controllers/activitiesController.js";
import {
  getAttendenceBySubject,
  getAttendenceByDate,
  getAttendenceSummaryByClassroom,
  getAttendenceSummaryBySubjectIsExam,
} from "../controllers/attendenceController.js";
import {
  getAllLeaveRequestForAdmin,
  getLeaveRequestForAdminByLeaveId,
} from "../controllers/leaverequestController.js";
import {
  getAllParent,
  getParentById,
} from "../controllers/parentController.js";

const router = Router();

// students Management
router.get("/students", getAllStudent);
router.post("/student", createStudent);
router.get("/students/softdeleted", getSoftDeletedStudents);
router.delete("/student/:stdId", softDeleteStudent);
router.put("/student/restore/:stdId", restoreSoftDeletedStudent);
router.get("/student/:uuid", getStudent);
router.put("/student", updateStudent);
router.post("/students/bulk", createStudentWithFile);
router.get("/students/withoutClassroom", getStudentwithoutClassroom);
router.get(
  "/students/foraddmemberinclassroom",
  getStudentforaddmemberinclassroom
); // ดึงข้อมูลนักเรียนที่ยังไม่มีห้องเรียน

// teacher Management
router.get("/teachers", getAllTeacher); // ดึงข้อมูลทั้งหมด teacher
router.get("/teachers/softdeleted", getSoftDeletedTeachers); // ดึงข้อมูล teacher ที่ถูกลบแบบ soft delete
router.put("/teacher/restore/:uuid", restoreTeacher); // กู้คืน teacher ที่ถูกลบแบบ soft delete
router.delete("/teacher/:uuid", deleteTeacher); // ลบข้อมูล teacher
router.post("/teacher", createTeacher); // สร้าง teacher
router.get("/teacher/:uuid", getTeacher); // ดึงข้อมูล teacher
router.put("/teacher/:uuid", updateTeacher); // แก้ไขข้อมูล teacher
router.get("/departments", getAllDepartment); // ดึงข้อมูลทั้งหมด department
router.post("/department", createDepartment); // สร้าง department
router.get("/department/:uuid", getDepartment); // ดึงข้อมูล department
router.put("/department/:uuid", updateDepartment); // แก้ไขข้อมูล department
router.delete("/department/:uuid", deleteDepartment); // ลบข้อมูล department

// classroom Management
router.get("/classrooms", getAllClassroom); // ดึงข้อมูลทั้งหมด classroom
router.post("/classroom", createClassroom); // สร้าง classroom
router.put("/classroom", updateClassroom); // แก้ไขข้อมูล classroom
router.get("/classrooms/softdeleted", getDeletedClassrooms); // ดึงข้อมูล classroom ที่ถูกลบแบบ soft delete
router.delete("/classroom/:uuid", softDeleteClassroom);
router.put("/classroom/restore/:uuid", restoreClassroom); // กู้คืน classroom ที่ถูกลบแบบ soft delete
router.get("/classroom/:uuid", getClassroom); // ดึงข้อมูล classroom
router.get("/classrooms/types", getAllClassroomType); // ดึงข้อมูลประเภทของห้องเรียน
router.post("/classroom/type", createClassroomType); // สร้างประเภทห้องเรียน
router.put("/classroom/type/:uuid", updateClassroomType); // แก้ไขประเภทห้องเรียน
router.delete("/classroom/type/:uuid", deleteClassroomType); // ลบประเภทห้องเรียน
router.post("/classroom/member", createClassroomMember); // เพิ่มสมาชิกห้องเรียน
router.put("/classroom/member/:uuid", updateClassroomMember); // แก้ไขสมาชิกห้องเรียน
router.delete("/classroom/member/:uuid", deleteClassroomMember); // ลบสมาชิกห้องเรียน
router.get("/termAndAcademicYear", getAcademicYearClassroom); // List เทอมและ ปีการศึกษา
router.get("/classrooms/byterm/:termId", getClassroomByAcademicYearTerm); // ดึงห้องเรียนตามปีการศึกษาและเทอม
router.get(
  "/classrooms/filterTA/:academicYear/:classroomLevel",
  getClassroomFilterByAcademicYearAndLevel
);
// leader Management
router.get("/leaders", getAllLeaders); // ดึงข้อมูลทั้งหมด leader

router.get("/search", featchDataForSeachbar);
// timetable Management
router.get("/timetableR", getTimeTableByRoom);
router.put("/timetable/editlatetime", editTimelateTimetable);
router.post("/timetable", createTimetable);
router.delete("/timetable/:timetableId", deleteTimetable);
// router.delete('/timetable/delete', deleteTimetable)
router.get("/subjectTimetable/:classroomId", getSubjectTimetable);

router.post("/timetable/bysubject", createTimetableByAddSubject);
router.post("/timetable/byswitchperiod", createTimetableBySwitchPeriod);
router.post(
  "/timetable/switchsubjectandsubject",
  createTimetableBySwitchSubjectAndSubject
);
// router.get('/timetable/bysubId/:subjectId', getTimeTableBySubjectId);
// subject Management
router.get("/subjects", getAllSubject);
router.post("/subject", createSubject);
router.delete("/subject/:uuid", softDeleteSubject);
router.put("/subject/restore/:uuid", restoreSubject);
router.get("/subjects/softdeleted", getSoftDeletedSubjects);
router.get("/subject/:UUID", getSubject);
router.put("/subject/:UUID", editSubject);
router.get("/subjects/type", getAllSubjectType);
router.post("/subject/type", createSubjectType);
router.put("/subject/type/:uuid", editSubjectType);
router.delete("/subject/type/:uuid", deleteSubejectType);

// Holiday
router.get("/holiday/:termId", getHolidayList); // Holiday List แต่ละเทอม
router.get("/holidayauto", getHolidayListAuto); // Holiday List สำหรับ Auto วันหยุดราชกาล
router.post("/holiday", createHoliday); // สร้างวันหยุด
router.put("/holiday/:holidayId", updateHoliday);
router.get("/holiday/one/:holidayId", getOneHoliday);
router.delete("/holiday/:holidayId", deleteHoliday); // ลบวันหยุด

// AcademicYear And Term

router.get("/term/:termId", getTermDateBetweenFilterHolidays);
router.get("/academicterms", getAllAcademicTerms); // List เทอมและ ปีการศึกษา
router.get("/academicterms/:termId", getOneAcademicTerm); // ดึงอันเดียว
router.put("/academicterms", updateTerm); // แก้ไข
router.post("/academicYearTerm", createTerm); // สร้างปีการศึกษาและเทอม
router.delete("/academicterms/:termId", deleteTerm); // ลบปีการศึกษาและเทอม

//Full calendar
router.get("/fullcalendarStudyTime/:classroomId", getFullCalendarStudyTime);
router.get("/fullcalendarHoliday/:classroomId", fullCalendarHoliday);

// Activities
router.post("/activity", createActivity);
router.get("/activity/softdeleted", getsoftDeletedActivity);
router.get("/activities/:type", getAllActivitiesByType);
router.get("/activity/:uuid", getActivity);
router.get("/activityType", getActivityType);
router.put("/activity/:uuid", editActivity);
router.get(
  "/activity/abstact/byclassroom/:activityId/:classId",
  abstactActivityClassroom
);
router.get("/activity/abstact/:activityId", abstactActivityFilterByRoom);
router.post("/activity/generate-qr", generateLinkActivityForQR); // generate link for QR code
router.delete("/activity/:uuid", softDeleteActivity); // soft delete activity
router.put("/activity/restore/:uuid", restoreSoftDeletedActivity);

//Attendence
router.get("/attendence/:subjectId/:classroomId", getAttendenceBySubject);
router.get("/attendence/byDate/:date/:classroomId", getAttendenceByDate);
router.get(
  "/atttendence/byClassroom/:classroomId",
  getAttendenceSummaryByClassroom
);
router.get(
  "/atttendence/abstract/:classroomId/:subjectId",
  getAttendenceSummaryBySubjectIsExam
);

// LeaveRequest
router.get("/leave-requests", getAllLeaveRequestForAdmin); // get leave request for admin
router.get("/leave-requests/:id", getLeaveRequestForAdminByLeaveId); // get leave request for admin by leave id

// Parent
router.get("/parents", getAllParent); // get all parent
router.get("/parent/:id", getParentById); // get parent by userId

export default router;
