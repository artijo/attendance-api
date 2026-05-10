import db from "../prisma/client.js";

export const createOne = (data) => db.teacher.create({ data });

export const findAll = (where = {}, include = {}, orderBy = []) =>
  db.teacher.findMany({ where, include, orderBy });

export const findById = (tchId, include = {}) =>
  db.teacher.findFirstOrThrow({ where: { tchId, deletedAt: null }, include });

export const findUnique = (tchId, include = {}) =>
  db.teacher.findUnique({ where: { tchId }, include });

export const updateById = (tchId, data) =>
  db.teacher.update({ where: { tchId }, data });

export const findSoftDeleted = () =>
  db.teacher.findMany({ where: { deletedAt: { not: null } } });

// Department
export const findAllDepartments = (where = {}) =>
  db.department.findMany({ where });

export const findDepartmentById = (deptId) =>
  db.department.findFirstOrThrow({ where: { deptId, deletedAt: null } });

export const createDepartment = (data) => db.department.create({ data });

export const updateDepartment = (deptId, data) =>
  db.department.update({ where: { deptId }, data });

// Excel related
export const findTimetablesBySubjectAndClass = (subId, classId) =>
  db.timetable.findMany({
    where: { AND: { subId, classId, deletedAt: null } },
    select: { timetableId: true },
  });

export const findStudingTimeByTimetableIds = (timetableIds) =>
  db.studingTime.findMany({
    where: { timetableId: { in: timetableIds } },
    select: { studyTimeId: true },
    orderBy: { studingTimeDate: "asc" },
  });

export const findClassroomMembersByClassId = (classId) =>
  db.classroomMember.findMany({
    where: { classId },
    select: { stdId: true },
  });

export const findStudentsWithAttendance = (studentIds, studyTimeIds) =>
  db.student.findMany({
    select: {
      fName: true,
      lName: true,
      attendance: {
        where: {
          AND: {
            stdId: { in: studentIds },
            studingTimeId: { in: studyTimeIds },
          },
        },
      },
    },
  });

export const findSubjectName = () =>
  db.subject.findFirst({ select: { subNameEng: true } });
