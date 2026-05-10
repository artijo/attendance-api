import db from "../prisma/client.js";
export const findAll = (include = {}) => db.leader.findMany({ include });
export const findByStdId = (stdId, include = {}) => db.leader.findFirst({ where: { stdId }, include });
export const findClassroomMembers = (classId, include = {}) => db.classroomMember.findMany({ where: { classId }, include });
export const findTimetables = (where, include = {}) => db.timetable.findMany({ where, include });
export const findStudingTime = (studingTimeId, include = {}) => db.studingTime.findUnique({ where: { studyTimeId: studingTimeId }, include });
