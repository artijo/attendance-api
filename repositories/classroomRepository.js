import db from "../prisma/client.js";

export const create = (data) => db.classrooms.create({ data });
export const update = (classId, data) => db.classrooms.update({ where: { classId }, data });
export const findUnique = (classId, include = {}) => db.classrooms.findUnique({ where: { classId }, include });
export const findMany = (where = {}, include = {}, orderBy = []) => db.classrooms.findMany({ where, include, orderBy });
export const findDeleted = () => db.classrooms.findMany({ where: { deletedAt: { not: null } } });

// Classroom Type
export const findAllTypes = (where = {}) => db.classroomType.findMany({ where });
export const createType = (data) => db.classroomType.create({ data });
export const updateType = (classTypeId, data) => db.classroomType.update({ where: { classTypeId }, data });

// Classroom Member
export const findMembers = (where = {}, select = {}, orderBy = {}) => db.classroomMember.findMany({ where, select, orderBy });
export const createMember = (data) => db.classroomMember.create({ data });
export const updateMember = (classRoomMemeberId, data) => db.classroomMember.update({ where: { classRoomMemeberId }, data });
export const findMemberClassroom = (classId) => db.classrooms.findUnique({ where: { classId }, select: { term: { select: { termId: true } } } });

// Classroom Teacher
export const createClassroomTeacher = (data) => db.classroomTeacher.create({ data });
export const deleteClassroomTeachers = (classId) => db.classroomTeacher.deleteMany({ where: { classId } });

// Leader
export const findLeader = (stdId) => db.leader.findFirst({ where: { stdId, deletedAt: null } });
export const createLeader = (data) => db.leader.create({ data });

// Teacher
export const findTeachers = (where = {}, include = {}) => db.teacher.findMany({ where, include });
