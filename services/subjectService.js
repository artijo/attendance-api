import { DateTime } from "luxon";
import { AppError } from "../utils/AppError.js";
import * as subjectRepository from "../repositories/subjectRepository.js";

export const createSubjectType = async (body) => subjectRepository.createType({ subTypeNameThai: body.subTypeNameThai, subTypeNameEng: body.subTypeNameEng });
export const selectSubjectType = async (uuid) => subjectRepository.findTypeById(uuid);
export const getAllSubjectType = async () => subjectRepository.findAllTypes({ deletedAt: null });
export const editSubjectType = async (uuid, body) => subjectRepository.updateType(uuid, { subTypeNameThai: body.subTypeNameThai, subTypeNameEng: body.subTypeNameEng });
export const deleteSubjectType = async (uuid) => { await subjectRepository.deleteType(uuid); return { message: "Delete Success" }; };

export const createSubject = async (body) => subjectRepository.create({ subCode: body.subCode, subNameThai: body.subNameThai, subNameEng: body.subNameEng, subCredit: parseFloat(body.subCredit), tchId: body.tchId, subTypeId: body.subTypeId });
export const editSubject = async (uuid, body) => subjectRepository.update(uuid, { subCode: body.subCode, subNameEng: body.subNameEng, subNameThai: body.subNameThai, subCredit: parseFloat(body.subCredit), tchId: body.tchId, subTypeId: body.subTypeId });
export const deleteSubject = async (uuid) => { await subjectRepository.update(uuid, { deletedAt: DateTime.now().toJSDate() }); return { message: "Delete subject success" }; };

export const getSubject = async (uuid) => {
  const subject = await subjectRepository.findById(uuid, {
    subjectType: true, teacher: true,
    timetable: { where: { deletedAt: null }, include: { classroom: { include: { term: true } }, studyTime: { where: { deletedAt: null }, include: { attendance: { where: { deletedAt: null } } } } } },
  });
  if (!subject) throw new AppError(404, "Subject not found");
  return subject;
};

export const getAllSubject = async () => subjectRepository.findAll({ deletedAt: null }, { subjectType: true, teacher: true });

export const getSubjectByTeacher = async (tchId) => {
  return subjectRepository.findByTeacher(tchId, {
    subjectType: true, teacher: true,
    timetable: { where: { deletedAt: null }, include: { classroom: { include: { term: true } }, studyTime: { where: { deletedAt: null } }, subject: { include: { teacher: true } } } },
  });
};

export const getSubjectByStudent = async (studentId, termId) => {
  if (!studentId || !termId) throw new AppError(400, "bad requset");
  const classroomMember = await subjectRepository.findClassroomMember(
    { stdId: studentId, deletedAt: null, classroom: { termId, deletedAt: null } },
    { classroom: { include: { timetable: { where: { deletedAt: null }, include: { subject: { include: { teacher: true } } } } } } }
  );
  if (!classroomMember) throw new AppError(404, "Student not found in this term");
  return classroomMember.classroom.timetable.reduce((acc, item) => {
    if (item.subject && !item.subject.deletedAt) {
      if (!acc.find((a) => a.subId === item.subject.subId)) acc.push(item.subject);
    }
    return acc;
  }, []);
};

export const softDeleteSubject = async (uuid) => { await subjectRepository.update(uuid, { deletedAt: new Date() }); return { message: "Soft delete subject success" }; };
export const restoreSubject = async (uuid) => { await subjectRepository.update(uuid, { deletedAt: null }); return { message: "Restore subject success" }; };
export const getSoftDeletedSubjects = async () => subjectRepository.findSoftDeleted({ subjectType: true, teacher: true });
export const softDeleteSubjectType = async (uuid) => { await subjectRepository.updateType(uuid, { deletedAt: new Date() }); return { message: "Soft delete subject type success" }; };
export const restoreSubjectType = async (uuid) => { await subjectRepository.updateType(uuid, { deletedAt: null }); return { message: "Restore subject type success" }; };
export const getSoftDeletedSubjectTypes = async () => subjectRepository.findSoftDeletedTypes();
