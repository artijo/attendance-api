import { DateTime } from "luxon";
import * as repo from "../repositories/studyingTimeRepository.js";
const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getFullCalendarStudyTime = async (classroomId) => {
  const timetables = await repo.findTimetables({ classId: classroomId }, { timetableId: true });
  const studyTimes = await repo.findStudingTimes(
    { timetableId: { in: timetables.map(t => t.timetableId) } },
    { studingTimeDate: "asc" },
    { timetable: { select: { subject: { select: { subCode: true, subNameThai: true, subNameEng: true } } } }, studingTimeDate: true }
  );
  return studyTimes.map(st => {
    const start = DateTime.fromJSDate(st.studingTimeDate).setZone(zone);
    return { title: `${st.timetable.subject.subCode}-${st.timetable.subject.subNameThai}`, start, end: start.plus({ minutes: 50 }) };
  });
};

export const getStudyingTimeById = async (studingTimeId) => {
  return repo.findStudingTimeUnique(studingTimeId, {
    timetable: { include: { classroom: { include: { classroomMembers: { include: { student: true } } } }, subject: true } },
    attendance: { include: { student: true, attMethod: true } },
  });
};
