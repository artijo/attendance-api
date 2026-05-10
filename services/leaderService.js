import { DateTime } from "luxon";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/leaderRepository.js";
const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getAllLeaders = async () => repo.findAll({ classroom: true });

export const getClassroomByStdId = async (stdId) => {
  const leader = await repo.findByStdId(stdId, { classroom: { include: { classroomType: true, term: true, classroomMembers: true, classTeacher: { include: { teacher: true } } } } });
  if (!leader) throw new AppError(404, "Leader not found");
  return leader.classroom;
};

export const getClassroomMembersByClassroomId = async (classId) => {
  const members = await repo.findClassroomMembers(classId, { student: true, classroom: { include: { classTeacher: { include: { teacher: true } }, term: true, classroomType: true } } });
  if (!members) throw new AppError(404, "Classroom members not found");
  return members;
};

export const getTimeTableAndStudyTime = async (classId) => {
  const todayDOW = DateTime.now().setZone(zone).weekday;
  const todayStart = DateTime.now().setZone(zone).startOf("day").toUTC().toJSDate();
  const todayEnd = DateTime.now().setZone(zone).endOf("day").toUTC().toJSDate();
  const tt = await repo.findTimetables({ classId, dayOfWeek: todayDOW, studyTime: { some: { studingTimeDate: { gte: todayStart, lte: todayEnd } } } }, { classroom: true, subject: { include: { teacher: true } }, studyTime: { where: { studingTimeDate: { gte: todayStart, lte: todayEnd } } } });
  if (!tt || tt.length === 0) throw new AppError(404, "Timetable not found");
  return tt;
};

export const getStudyingTimeById = async (studingTimeId) => {
  return repo.findStudingTime(studingTimeId, { timetable: { include: { classroom: { include: { classroomMembers: { include: { student: true } } } }, subject: true } }, attendance: { include: { student: true, attMethod: true } } });
};
