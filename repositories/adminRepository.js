import db from "../prisma/client.js";

export const findAll = () => db.admin.findMany();
export const findById = (adminId) => db.admin.findUnique({ where: { adminId } });

export const findAllStudents = () =>
  db.student.findMany({ select: { stdId: true, fName: true, lName: true } });

export const findAllTeachers = () =>
  db.teacher.findMany({ select: { tchId: true, fName: true, lName: true } });

export const findAllLeaders = () =>
  db.leader.findMany({ select: { ldrId: true, fName: true, lName: true } });
