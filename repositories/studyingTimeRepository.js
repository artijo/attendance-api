import db from "../prisma/client.js";
export const findTimetables = (where, select = {}) => db.timetable.findMany({ where, select });
export const findStudingTimes = (where, orderBy = {}, select = {}) => db.studingTime.findMany({ where, orderBy, select });
export const findStudingTimeUnique = (studyTimeId, include = {}) => db.studingTime.findUnique({ where: { studyTimeId }, include });
