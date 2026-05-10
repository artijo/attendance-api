import db from "../prisma/client.js";

export const createOne = (data) => {
  return db.student.create({ data });
};

export const createMany = (data, skipDuplicates = true) => {
  return db.student.createMany({ data, skipDuplicates });
};

export const findAll = (where = {}, include = {}) => {
  return db.student.findMany({ where, include });
};

export const findById = (stdId, include = {}) => {
  return db.student.findFirstOrThrow({
    where: { stdId, deletedAt: null },
    include,
  });
};

export const findFirst = (where, include = {}) => {
  return db.student.findFirst({ where, include });
};

export const updateById = (stdId, data) => {
  return db.student.update({ where: { stdId: String(stdId) }, data });
};

export const findStudentsWithoutClassroom = () => {
  return db.student.findMany({
    where: { deletedAt: null, classroomMembers: { none: {} } },
    select: { stdId: true, title: true, fName: true, lName: true, email: true, tel: true },
    orderBy: { stdId: "asc" },
  });
};

export const findStudentsForAddMember = () => {
  return db.student.findMany({
    where: { deletedAt: null },
    select: { stdId: true, title: true, fName: true, lName: true, email: true, tel: true },
    orderBy: { stdId: "asc" },
  });
};

export const findSoftDeleted = () => {
  return db.student.findMany({
    where: { deletedAt: { not: null } },
  });
};

export const findClassroomByLevel = (classLevel, classRoom) => {
  return db.classrooms.findFirst({
    where: { classLevel: parseInt(classLevel), classRoom: parseInt(classRoom), deletedAt: null },
  });
};

export const findClassroomMembers = (classId) => {
  return db.classroomMember.findMany({
    where: { classId, deletedAt: null },
    select: { student: true },
  });
};

export const createClassroomMembers = (data, skipDuplicates = true) => {
  return db.classroomMember.createMany({ data, skipDuplicates });
};

export const findBehaviourScoreTransactions = (stdId) => {
  return db.behaviourScoreTransaction.findMany({
    where: { stdId, deletedAt: null },
    include: {
      studingTime: {
        include: {
          timetable: {
            include: { subject: true, classroom: { include: { term: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findAcademicTerms = () => {
  return db.academicTerms.findMany({ where: { deletedAt: null } });
};

export const findStudentDashboard = (stdId, termId) => {
  return db.student.findFirst({
    where: { stdId, deletedAt: null },
    include: {
      classroomMembers: {
        where: {
          deletedAt: null,
          classroom: { termId, deletedAt: null },
        },
        include: {
          classroom: {
            include: {
              term: true,
              classroomType: true,
              classTeacher: {
                where: { deletedAt: null },
                include: { teacher: true },
              },
            },
          },
        },
      },
    },
  });
};

export const countPendingLeaves = (stdId) => {
  return db.leaveRequest.count({
    where: {
      stdId,
      deletedAt: null,
      studingTime: { some: { leaveStatus: "WAITING", deletedAt: null } },
    },
  });
};

export const findAllClassrooms = () => {
  return db.classrooms.findMany({ where: { deletedAt: null } });
};

export const findClassroomTypeDefault = () => {
  return db.classroomType.findFirst({
    where: {
      OR: [
        { classTypeNameEng: "Unspecified" },
        { classTypeNameThai: "ไม่ระบุ" },
      ],
      deletedAt: null,
    },
  });
};

export const findAcademicTermByYearSemester = (academicYear, semester) => {
  return db.academicTerms.findFirst({
    where: { academicYear, semester, deletedAt: null },
  });
};

export const createAcademicTerm = (data) => {
  return db.academicTerms.create({ data });
};

export const createClassroom = (data) => {
  return db.classrooms.create({ data });
};
