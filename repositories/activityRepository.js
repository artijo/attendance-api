import db from "../prisma/client.js";

export const findActivities = (where = {}, include = {}, orderBy = {}) => db.activity.findMany({ where, include, orderBy });
export const findActivityById = (actId, include = {}) => db.activity.findUnique({ where: { actId }, include });
export const createActivity = (data) => db.activity.create({ data });
export const updateActivity = (actId, data) => db.activity.update({ where: { actId }, data });
export const findActivityTypes = () => db.activityType.findMany();
export const findParticipation = (where = {}, include = {}) => db.activityParticipation.findMany({ where, include });
export const createParticipation = (data) => db.activityParticipation.create({ data });
export const createManyParticipation = (data) => db.activityParticipation.createMany({ data, skipDuplicates: true });
export const findParticipationFirst = (where) => db.activityParticipation.findFirst({ where });
export const findClassroomMembers = (where, include = {}) => db.classroomMember.findMany({ where, include });
export const findStudentById = (stdId) => db.student.findUnique({ where: { stdId } });
export const findClassroom = (classId, include = {}) => db.classrooms.findUnique({ where: { classId }, include });
export const findClassrooms = (where = {}, include = {}, orderBy = []) => db.classrooms.findMany({ where, include, orderBy });
export const findLeaderByStdId = (stdId) => db.leader.findFirst({ where: { stdId } });
