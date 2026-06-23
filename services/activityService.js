import { DateTime } from "luxon";
import { generateToken, verifyToken } from "../helper/jwt.js";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/activityRepository.js";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getAllActivitiesByType = async (actTypeId) => {
  return await repo.findActivities({ actTypeId, deletedAt: null }, { activityType: true, teacher: true, actParticipate: true }, { actDate: "desc" });
};

export const getActivity = async (actId) => {
  const act = await repo.findActivityById(actId, { activityType: true, teacher: true, participations: { include: { classroomMember: { include: { student: true, classroom: true } } } } });
  if (!act) throw new AppError(404, "Activity not found");
  return act;
};

export const getActivityType = async () => repo.findActivityTypes();

export const createActivity = async (body) => {
  const actDate = DateTime.fromISO(body.actDate).setZone(zone).toJSDate();
  const actDateEnd = DateTime.fromISO(body.actDateEnd).setZone(zone).toJSDate();
  const act = await repo.createActivity({
    actName: body.actName, actDate, actDateEnd , joinLimit: body.joinLimit, actDesc: body.actDesc || null,
    activityType: { connect: { actTypeId: body.actTypeId } },
    teacher: {
      create: body.teacher.map(t => ({
        tchId: t.tchId  // ใส่ตรงๆ ได้เลย ไม่ต้อง nested connect
      }))
    },
    actLocation: body.actLocation || null, actStartTime: body.actStartTime || null, actEndTime: body.actEndTime || null,
    actStatus: "PROCESSING"
  });
  if (body.classroomIds && body.classroomIds.length > 0) {
    for (const classId of body.classroomIds) {
      const members = await repo.findClassroomMembers({ classId, deletedAt: null });
      const data = members.map(m => ({ actId: act.actId, classRoomMemeberId: m.classRoomMemeberId }));
      await repo.createManyParticipation(data);
    }
  }
  return { message: "Create Activity Success" };
};

export const editActivity = async (actId, body) => {
  const actDate = DateTime.fromISO(body.actDate).setZone(zone).toJSDate();
  await repo.updateActivity(actId, {
    actName: body.actName, actDate, actDetail: body.actDetail || null,
    activityType: { connect: { actTypeId: body.actTypeId } },
    teacher: { connect: { tchId: body.tchId } },
    location: body.location || null, actStartTime: body.actStartTime || null, actEndTime: body.actEndTime || null,
  });
  return { message: "Edit Activity Success" };
};

export const getActivityByTeacher = async (tchId) => {
  return repo.findActivities({ tchId, deletedAt: null }, { activityType: true, participations: true }, { actDate: "desc" });
};

export const paticipatedActivityByteacher = async (body) => {
  const { actId, classRoomMeberIds } = body;
  if (!actId || !classRoomMeberIds) throw new AppError(400, "ข้อมูลไม่ครบถ้วน");
  for (const id of classRoomMeberIds) {
    const existing = await repo.findParticipationFirst({ actId, classRoomMemeberId: id });
    if (!existing) await repo.createParticipation({ actId, classRoomMemeberId: id, participationDate: DateTime.now().setZone(zone).toJSDate(), attStatus: "PRESENT" });
    else if (!existing.participationDate) {
      await repo.createParticipation({ actId, classRoomMemeberId: id, participationDate: DateTime.now().setZone(zone).toJSDate(), attStatus: "PRESENT" });
    }
  }
  return { message: "บันทึกการเข้าร่วมกิจกรรมสำเร็จ" };
};

export const abstactActivityClassroom = async (actId) => {
  const act = await repo.findActivityById(actId, { participations: { include: { classroomMember: { include: { student: true, classroom: true } } } } });
  if (!act) throw new AppError(404, "Activity not found");
  return act;
};

export const abstactActivityFilterByRoom = async (actId, classId) => {
  const participations = await repo.findParticipation(
    { actId, classroomMember: { classId } },
    { classroomMember: { include: { student: true, classroom: true } } }
  );
  return participations;
};

export const generateLinkActivityForQR = async (actId, teacherId) => {
  const token = generateToken({ actId, teacherId }, "30m");
  return { linkUrl: `${process.env.STUDENT_WEB_CLIENT}/activity/qr?token=${token}`, token };
};

export const saveActivityByStudentWithQR = async (studentId, token) => {
  if (!token) throw new AppError(400, "ไม่พบ Token");
  const decoded = verifyToken(token);
  if (!decoded) throw new AppError(401, "Token ไม่ถูกต้องหรือหมดอายุ");
  const member = await repo.findClassroomMembers({ stdId: studentId, deletedAt: null });
  if (!member || member.length === 0) throw new AppError(404, "ไม่พบข้อมูลนักเรียน");
  const existing = await repo.findParticipationFirst({ actId: decoded.actId, classRoomMemeberId: member[0].classRoomMemeberId });
  if (existing && existing.participationDate) throw new AppError(400, "เช็คชื่อไปแล้ว");
  await repo.createParticipation({ actId: decoded.actId, classRoomMemeberId: member[0].classRoomMemeberId, participationDate: DateTime.now().setZone(zone).toJSDate(), attStatus: "PRESENT" });
  return { message: "เช็คชื่อกิจกรรมสำเร็จ" };
};

export const getActivityByLeader = async (stdId) => {
  const leader = await repo.findLeaderByStdId(stdId);
  if (!leader) throw new AppError(404, "Leader not found");
  const members = await repo.findClassroomMembers({ classId: leader.classId, deletedAt: null });
  const memberIds = members.map(m => m.classRoomMemeberId);
  return repo.findActivities({ deletedAt: null, participations: { some: { classRoomMemeberId: { in: memberIds } } } }, { activityType: true, participations: { where: { classRoomMemeberId: { in: memberIds } } } }, { actDate: "desc" });
};

export const paticipatedActivityByLeader = async (body) => paticipatedActivityByteacher(body);

export const getActivityStudent = async (studentId) => {
  const member = await repo.findClassroomMembers({ stdId: studentId, deletedAt: null });
  if (!member || member.length === 0) return [];
  const participations = await repo.findParticipation(
    { classRoomMemeberId: { in: member.map(m => m.classRoomMemeberId) } },
    { activity: { include: { activityType: true } } }
  );
  return participations;
};

export const activityCheckIn = async (studentId, actId) => {
  const member = await repo.findClassroomMembers({ stdId: studentId, deletedAt: null });
  if (!member || member.length === 0) throw new AppError(404, "ไม่พบข้อมูลนักเรียน");
  const existing = await repo.findParticipationFirst({ actId, classRoomMemeberId: member[0].classRoomMemeberId });
  if (existing && existing.participationDate) throw new AppError(400, "เช็คชื่อไปแล้ว");
  await repo.createParticipation({ actId, classRoomMemeberId: member[0].classRoomMemeberId, participationDate: DateTime.now().setZone(zone).toJSDate(), attStatus: "PRESENT" });
  return { message: "เช็คชื่อกิจกรรมสำเร็จ" };
};

export const isActivityThisTimeCheckIn = async (studentId, actId) => {
  const member = await repo.findClassroomMembers({ stdId: studentId, deletedAt: null });
  if (!member || member.length === 0) return { isCheckIn: false };
  const existing = await repo.findParticipationFirst({ actId, classRoomMemeberId: member[0].classRoomMemeberId });
  return { isCheckIn: existing && existing.participationDate ? true : false };
};

export const activityHistoryStudent = async (studentId) => getActivityStudent(studentId);

export const softDeleteActivity = async (actId) => {
  await repo.updateActivity(actId, { deletedAt: DateTime.now().toJSDate() });
  return { message: "Soft Delete Activity Success" };
};

export const getSoftDeletedActivities = async () => repo.findActivities({ deletedAt: { not: null } }, { activityType: true, teacher: true });

export const restoreSoftDeletedActivity = async (actId) => {
  await repo.updateActivity(actId, { deletedAt: null });
  return { message: "Restore Activity Success" };
};
