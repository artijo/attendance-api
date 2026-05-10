import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/parentRepository.js";

export const createParent = async (userId, displayName) => {
  const existing = await repo.findByLineId(userId);
  if (existing) throw new AppError(400, "Parent already exists");
  return repo.create({ lineId: userId, name: displayName });
};

export const getAllStudentParent = async (userId) => {
  const parent = await repo.findByLineId(userId);
  if (!parent) throw new AppError(404, "Parent not found");
  return repo.findStudentParents({ prntId: parent.prntId }, { student: { include: { classroomMembers: { include: { classroom: true } } } } });
};

export const studentLookup = async (studentId) => {
  const student = await repo.findStudent(studentId, { classroomMembers: { include: { classroom: true } } });
  if (!student) throw new AppError(404, "Student not found");
  return student;
};

export const addStudentParent = async (studentId, userId) => {
  const student = await repo.findStudent(studentId);
  if (!student) throw new AppError(404, "Student not found");
  const parent = await repo.findByLineId(userId);
  if (!parent) throw new AppError(404, "Parent not found");
  const linked = await repo.findStudentParentFirst({ stdId: student.stdId, prntId: parent.prntId });
  if (linked) throw new AppError(400, "Student is already linked to this parent");
  return repo.createStudentParent({ stdId: student.stdId, prntId: parent.prntId });
};

export const deleteStudentParent = async (studentId, userId) => {
  const student = await repo.findStudent(studentId);
  if (!student) throw new AppError(404, "Student not found");
  const parent = await repo.findByLineId(userId);
  if (!parent) throw new AppError(404, "Parent not found");
  return repo.deleteStudentParents({ stdId: student.stdId, prntId: parent.prntId });
};

export const getParentByLineId = async (userId) => {
  const parent = await repo.findByLineId(userId);
  if (!parent) throw new AppError(404, "Parent not found");
  return parent;
};

export const updateParent = async (userId, name, email, tel) => {
  const parent = await repo.findByLineId(userId);
  if (!parent) throw new AppError(404, "Parent not found");
  return repo.update(userId, { name, email, tel });
};

export const getAllParent = async () => repo.findAll({ student: { include: { student: true } } });

export const getParentById = async (id) => {
  const parent = await repo.findById(id, { student: { include: { student: true } } });
  if (!parent) throw new AppError(404, "Parent not found");
  return parent;
};
