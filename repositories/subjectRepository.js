import db from "../prisma/client.js";

export const createType = (data) => db.subjectType.create({ data });
export const findTypeById = (subTypeId) => db.subjectType.findFirstOrThrow({ where: { subTypeId } });
export const findAllTypes = (where = {}) => db.subjectType.findMany({ where });
export const updateType = (subTypeId, data) => db.subjectType.update({ where: { subTypeId }, data });
export const deleteType = (subTypeId) => db.subjectType.delete({ where: { subTypeId } });

export const create = (data) => db.subject.create({ data });
export const update = (subId, data) => db.subject.update({ where: { subId }, data });
export const findById = (subId, include = {}) => db.subject.findFirst({ where: { subId, deletedAt: null }, include });
export const findAll = (where = {}, include = {}) => db.subject.findMany({ where, include });
export const findSoftDeleted = (include = {}) => db.subject.findMany({ where: { deletedAt: { not: null } }, include });
export const findSoftDeletedTypes = () => db.subjectType.findMany({ where: { deletedAt: { not: null } } });

export const findByTeacher = (tchId, include = {}) => db.subject.findMany({ where: { tchId, deletedAt: null }, include });

export const findClassroomMember = (where, include = {}) => db.classroomMember.findFirst({ where, include });
