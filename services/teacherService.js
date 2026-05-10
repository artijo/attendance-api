import { hashPassword } from "../helper/bcrypt.js";
import { createExcelSubjectAttendence } from "../helper/excel.js";
import { AppError } from "../utils/AppError.js";
import * as teacherRepository from "../repositories/teacherRepository.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTeacher = async (body) => {
  let password = null;
  if (body.password) {
    password = await hashPassword(body.password);
  }
  return teacherRepository.createOne({
    fName: body.fName,
    lName: body.lName,
    password: body.password ? password : null,
    email: body.email == "" ? null : body.email,
    tel: body.tel == "" ? null : body.tel,
    department: { connect: { deptId: body.deptId } },
  });
};

export const getAllTeacher = async () => {
  return teacherRepository.findAll(
    { deletedAt: null },
    {
      department: true,
      classTeacher: {
        where: { deletedAt: null },
        include: { classroom: { include: { term: true } } },
      },
    },
    [{ fName: "asc" }]
  );
};

export const updateTeacher = async (uuid, body) => {
  let updateData = {
    fName: body.fName,
    lName: body.lName,
    email: body.email == "" ? null : body.email,
    tel: body.tel == "" ? null : body.tel,
    department: { connect: { deptId: body.deptId } },
  };
  if (body.password || body.password === "") {
    const hashedPassword = await hashPassword(body.password);
    updateData.password = hashedPassword;
  }
  return teacherRepository.updateById(uuid, updateData);
};

export const getTeacher = async (uuid) => {
  return teacherRepository.findById(uuid, {
    department: true,
    classTeacher: {
      where: { deletedAt: null },
      include: { classroom: { include: { term: true } } },
    },
  });
};

export const deleteTeacher = async (uuid) => {
  await teacherRepository.updateById(uuid, { deletedAt: new Date() });
  return { message: "ลบข้อมูลครูสำเร็จ" };
};

export const getStudentAllAttendenceExcelOneSubject = async (subjectId, classroomId) => {
  const timetable = await teacherRepository.findTimetablesBySubjectAndClass(subjectId, classroomId);
  const timetableIds = timetable.map((item) => item.timetableId);
  const studingTime = await teacherRepository.findStudingTimeByTimetableIds(timetableIds);
  const studentInThisClassRoom = await teacherRepository.findClassroomMembersByClassId(classroomId);
  const stutingTimes = studingTime.map((item) => item.studyTimeId);
  const studentInClassroom = studentInThisClassRoom.map((item) => item.stdId);
  const student = await teacherRepository.findStudentsWithAttendance(studentInClassroom, stutingTimes);
  const subjectName = await teacherRepository.findSubjectName();
  const fileName = await createExcelSubjectAttendence(student, subjectName.subNameEng);
  return path.join(__dirname, `../public/${fileName}`);
};

export const getAllDepartment = async () => {
  return teacherRepository.findAllDepartments({ deletedAt: null });
};

export const getDepartment = async (uuid) => {
  return teacherRepository.findDepartmentById(uuid);
};

export const createDepartment = async (body) => {
  return teacherRepository.createDepartment({ deptName: body.deptName });
};

export const updateDepartment = async (uuid, body) => {
  return teacherRepository.updateDepartment(uuid, { deptName: body.deptName });
};

export const deleteDepartment = async (uuid) => {
  await teacherRepository.updateDepartment(uuid, { deletedAt: new Date() });
  return { message: "delete success" };
};

export const getTeacherInfo = async (teacherId) => {
  const teacher = await teacherRepository.findUnique(teacherId, {
    department: true,
    classTeacher: {
      where: { deletedAt: null },
      include: { classroom: { include: { term: true } } },
    },
    subject: { where: { deletedAt: null } },
    activity: { where: { deletedAt: null } },
  });
  if (!teacher || teacher.deletedAt) {
    throw new AppError(404, "Teacher not found");
  }
  return teacher;
};

export const restoreTeacher = async (uuid) => {
  await teacherRepository.updateById(uuid, { deletedAt: null });
  return { message: "คืนค่าข้อมูลครูสำเร็จ" };
};

export const getSoftDeletedTeachers = async () => {
  return teacherRepository.findSoftDeleted();
};
