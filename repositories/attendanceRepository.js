import db from "../prisma/client.js";

export const findAttendance = (where) => db.attendance.findFirst({ where });
export const findManyAttendance = (where = {}, include = {}, orderBy = {}) => db.attendance.findMany({ where, include, orderBy });
export const createAttendance = (data) => db.attendance.create({ data });
export const updateAttendance = (attId, data) => db.attendance.update({ where: { attId }, data });
export const deleteAttendance = (attId) => db.attendance.delete({ where: { attId } });
export const deleteManyAttendance = (where) => db.attendance.deleteMany({ where });

export const findTimetables = (where, orderBy = [], select, include) => {
  const q = { where };
  if (orderBy.length) q.orderBy = orderBy;
  if (select) q.select = select;
  if (include) q.include = include;
  return db.timetable.findMany(q);
};

export const findClassroomMembers = (where, select, orderBy) => {
  const q = { where };
  if (select) q.select = select;
  if (orderBy) q.orderBy = orderBy;
  return db.classroomMember.findMany(q);
};

export const findStudingTime = (where = {}, include = {}, orderBy = {}) => db.studingTime.findMany({ where, include, orderBy });
export const findStudingTimeUnique = (studyTimeId, include = {}) => db.studingTime.findUnique({ where: { studyTimeId }, include });

export const findAttendanceMethod = (where) => db.attendanceMethod.findFirst({ where });

export const findStudent = (stdId, include = {}) => db.student.findUnique({ where: { stdId }, include });

export const createBehaviourScoreTransaction = (data) => db.behaviourScoreTransaction.create({ data });
export const updateManyClassroomMembers = (where, data) => db.classroomMember.updateMany({ where, data });

export const findClassroom = (classId, include = {}) => db.classrooms.findUnique({ where: { classId }, include });

export const findStudentParents = (stdId) => db.studentParent.findMany({ where: { stdId }, include: { parent: true } });

export const findAcademicTerms = () => db.academicTerms.findMany();
export const findAcademicTermByDateRange = (date) => db.academicTerms.findFirst({
  where: { termStart: { lte: date }, termEnd: { gte: date } },
});

export const findClassroomMemberFirst = (where, include = {}) => db.classroomMember.findFirst({ where, include });

export const findAttendanceWithDetails = (attId) => db.attendance.findUnique({
  where: { attId },
  include: { student: true, studingTime: { include: { timetable: { include: { subject: true, classroom: true } } } }, attMethod: true },
});
