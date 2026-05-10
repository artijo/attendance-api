import db from "../prisma/client.js";

export const findAll = (orderBy = []) => db.academicTerms.findMany({ orderBy });
export const findById = (termId, include = {}) => db.academicTerms.findFirst({ where: { termId: String(termId) }, include });
export const findUnique = (termId) => db.academicTerms.findUnique({ where: { termId } });
export const create = (data) => db.academicTerms.create({ data });
export const update = (termId, data) => db.academicTerms.update({ where: { termId }, data });
export const remove = (termId) => db.academicTerms.delete({ where: { termId: String(termId) } });
export const findByYearSemester = (academicYear, semester) => db.academicTerms.findFirst({ where: { academicYear, semester } });
export const findMinTermStart = () => db.academicTerms.findFirst({ orderBy: { termStart: "asc" } });
export const findMaxTermEnd = () => db.academicTerms.findFirst({ orderBy: { termEnd: "desc" } });
export const findOverlapping = (termStart, termEnd) => db.academicTerms.findMany({ where: { termStart: { lte: termEnd }, termEnd: { gte: termStart } } });
export const findHolidays = (termId) => db.holiday.findMany({ where: { termId }, orderBy: { startHolidayDate: "asc" } });
export const findClassroomMembersByStudent = (stdId) => db.classroomMember.findMany({ where: { stdId }, include: { classroom: { include: { term: { include: { holiday: true } } } } } });
