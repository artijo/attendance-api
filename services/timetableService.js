import { DateTime } from "luxon";
import { daybetween, formatDayOfWeeks } from "../helper/helper.js";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/timetableRepository.js";
const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export { createTimetableByAddSubject, createTimetableBySwitchPeriod, createTimetableBySwitchSubjectAndSubject, createTimetable, editTimelateTimetable, getTimeTableByRoom, deleteTimetableService, getSubjectTimetable, getTimeTable, getTimetableRoleStudent };

async function createTimetableByAddSubject(body) {
  const { classroom, timetable, schedule, weekday } = body;
  if (!classroom || !timetable || !schedule || !weekday) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  const findPeriod = await repo.findTimetable({ AND: [{ classId: classroom.classId }, { timeStart: schedule.startDatabaseFormat }, { timeEnd: schedule.endDatabaseFormat }, { dayOfWeek: Number(timetable.dayOfWeek) }] });
  if (findPeriod) { await repo.updateTimetable(findPeriod.timetableId, { subId: timetable.subject.subId }); return { message: "update successful" }; }
  const subOnTT = await repo.findTimetables({ AND: [{ subId: timetable.subject.subId }, { classroom: { termId: classroom.termId } }] }, { subject: true, classroom: true });
  const exists = subOnTT.find(({ timeStart, timeEnd, dayOfWeek }) => String(timeStart) === schedule.startDatabaseFormat && String(timeEnd) === schedule.endDatabaseFormat && dayOfWeek === Number(weekday));
  if (exists) throw new AppError(400, `ไม่สามารถสร้างวิชานี้ได้เนื่องจาก ${exists.subject.subNameThai} อยู่ในคาบวัน ${formatDayOfWeeks(exists.dayOfWeek)} คาบเวลา ${schedule.timetableformate} ห้องม.${exists.classroom.classLevel}/${exists.classroom.classRoom}`);
  const created = await repo.createTimetable({ subId: timetable.subject.subId, classId: classroom.classId, timeStart: timetable.timeStart, timeEnd: timetable.timeEnd, timeLate: timetable.timeLate, dayOfWeek: Number(timetable.dayOfWeek) });
  await generateStudyTimes(created, classroom.term, Number(timetable.dayOfWeek));
  return { message: "create successful" };
}

async function generateStudyTimes(timetable, term, dayOfWeek) {
  const holidays = await repo.findHolidays(term.termId);
  const hDates = holidays.map(h => DateTime.fromJSDate(h.startHolidayDate).setZone(zone).toISODate());
  const dates = daybetween(term.termStart, term.termEnd).filter(d => { const wd = DateTime.fromISO(`${d}T${timetable.timeStart}`).setZone(zone).weekday; return wd !== 6 && wd !== 7; }).filter(d => !hDates.includes(d));
  for (const d of dates) { const dt = DateTime.fromISO(`${d}T${timetable.timeStart}`).setZone(zone); if (Number(dt.weekday) === dayOfWeek) await repo.createStudingTime({ timetable: { connect: { timetableId: timetable.timetableId } }, studingTimeDate: dt }); }
}

async function createTimetableBySwitchPeriod(body) {
  const { classroom, timetable, schedule, weekday } = body;
  if (!timetable) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  const subOnTT = await repo.findTimetables({ AND: [{ subId: timetable.subId }, { classroom: { termId: classroom.termId } }] }, { subject: true, classroom: true });
  const exists = subOnTT.find(({ timeStart, timeEnd, dayOfWeek }) => String(timeStart) === schedule.startDatabaseFormat && String(timeEnd) === schedule.endDatabaseFormat && dayOfWeek === Number(timetable.dayOfWeek));
  if (exists) throw new AppError(400, `ไม่สามารถสร้างวิชานี้ได้เนื่องจาก ${exists.subject.subNameThai} อยู่ในคาบวัน ${formatDayOfWeeks(exists.dayOfWeek)} คาบเวลา ${schedule.timetableformate} ห้องม.${exists.classroom.classLevel}/${exists.classroom.classRoom}`);
  await repo.updateTimetable(timetable.timetableId, { subId: timetable.subId, classId: timetable.classId, timeStart: timetable.timeStart, timeEnd: timetable.timeEnd, timeLate: timetable.timeLate, dayOfWeek: timetable.dayOfWeek });
  const stOnPeriod = await repo.findStudingTime({ timetableId: timetable.timetableId }, {}, { studingTimeDate: "asc" });
  if (stOnPeriod.length > 0) {
    for (const st of stOnPeriod) {
      const old = DateTime.fromJSDate(st.studingTimeDate).setZone(zone);
      const oldWD = old.weekday;
      let nf;
      if (weekday > oldWD) nf = DateTime.fromISO(`${old.toString().split("T")[0]}T${timetable.timeStart}`).plus({ day: weekday - oldWD }).setZone(zone);
      else if (weekday < oldWD) nf = DateTime.fromISO(`${old.toString().split("T")[0]}T${timetable.timeStart}`).minus({ day: oldWD - weekday }).setZone(zone);
      else nf = DateTime.fromISO(`${old.toString().split("T")[0]}T${timetable.timeStart}`).setZone(zone);
      await repo.updateStudingTime(st.studyTimeId, { studingTimeDate: nf });
    }
  }
  return { message: "create successful" };
}

async function createTimetableBySwitchSubjectAndSubject(body) {
  const { firstTimetable, secondTimetable } = body;
  if (!firstTimetable || !secondTimetable) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  async function check(ft, st) {
    const s = await repo.findTimetables({ AND: [{ subId: ft.subId }, { classroom: { termId: ft.classroom.termId } }] }, { subject: true, classroom: true });
    return s.find(({ timeStart, timeEnd, dayOfWeek }) => String(timeStart) === st.timeStart && String(timeEnd) === st.timeEnd && dayOfWeek === Number(st.dayOfWeek)) !== undefined;
  }
  if (await check(firstTimetable, secondTimetable)) throw new AppError(400, "ไม่สามารถสลับวิชานี้ได้เนื่องจากมีวิชาที่คาบซ่ำกันอยู่");
  if (await check(secondTimetable, firstTimetable)) throw new AppError(400, "ไม่สามารถสลับวิชานี้ได้เนื่องจากมีวิชาที่คาบซ่ำกันอยู่");
  await repo.updateTimetable(firstTimetable.timetableId, { subId: secondTimetable.subId });
  await repo.updateTimetable(secondTimetable.timetableId, { subId: firstTimetable.subId });
  return { message: "create successful" };
}

async function createTimetable(body) {
  const { subject, timelate, schedule, classroom, day } = body;
  if (!subject || !timelate || !schedule || !classroom || !day) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  const subOnTT = await repo.findTimetables({ AND: [{ subId: subject.subId }, { classroom: { termId: classroom.termId } }] }, { subject: true, classroom: true });
  const exists = subOnTT.find(({ timeStart, timeEnd, dayOfWeek }) => String(timeStart) === schedule.startDatabaseFormat && String(timeEnd) === schedule.endDatabaseFormat && dayOfWeek === Number(day));
  if (exists) throw new AppError(400, `ไม่สามารถสร้างวิชานี้ได้`);
  const tld = DateTime.fromISO(schedule.startDatabaseFormat).setZone(zone).plus({ minutes: timelate });
  const tt = await repo.createTimetable({ subId: subject.subId, classId: classroom.classId, timeStart: schedule.startDatabaseFormat, timeEnd: schedule.endDatabaseFormat, timeLate: tld.toFormat("HH:mm:ss"), dayOfWeek: Number(day) });
  await generateStudyTimes(tt, classroom.term, Number(day));
  return { message: "สร้างสำเร็จ" };
}

async function editTimelateTimetable(body) {
  if (!body.lateTime || !body.timetable) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  await repo.updateTimetable(body.timetable.timetableId, { timeLate: String(body.lateTime) });
  return { message: "สร้างสำเร็จ" };
}

async function getTimeTableByRoom(classId) {
  if (!classId) throw new AppError(400, "Invalid input data.");
  const tt = await repo.findTimetables({ classId }, { classroom: { include: { term: true } }, subject: { include: { teacher: true, subjectType: true } } }, [{ dayOfWeek: "asc" }, { timeStart: "asc" }]);
  const dow = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  Object.keys(dow).forEach(k => { tt.forEach(t => { if (Number(k) === Number(t.dayOfWeek)) dow[k].push(t); }); });
  return dow;
}

async function deleteTimetableService(timetableId) {
  const st = await repo.findStudingTime({ timetableId });
  if (st.length > 0) {
    const ids = st.map(s => s.studyTimeId);
    await repo.deleteLeaveRequestStudingTime({ studyTimeId: { in: ids } });
    await repo.deleteAttendance({ studingTimeId: { in: ids } });
    await repo.deleteStudingTime({ timetableId });
  }
  await repo.deleteTimetable(timetableId);
  return "delete successfully!";
}

async function getSubjectTimetable(classroomId) {
  const tt = await repo.findTimetables({ classId: classroomId }, {}, [{ dayOfWeek: "asc" }, { timeStart: "asc" }]);
  // Reuse existing inline select logic
  const tts = await repo.findTimetables({ classId: classroomId }, { classroom: { select: { classId: true } }, subject: { select: { subId: true, subNameEng: true, subNameThai: true, subCode: true, subCredit: true, teacher: { select: { tchId: true, fName: true, lName: true } } } } }, [{ dayOfWeek: "asc" }, { timeStart: "asc" }]);
  const list = tts.map(i => i.subject);
  return list.filter((v, i, s) => s.findIndex(x => x.subId === v.subId) === i);
}

async function getTimeTable(classId, dayOfWeek) {
  const tts = await repo.findTimetables({ AND: { classId: String(classId), dayOfWeek: Number(dayOfWeek) } }, {}, [{ timeStart: "asc" }]);
  const formatTime = (time) => { const dt = DateTime.now().setZone(zone); return DateTime.fromISO(`${dt.year}-${dt.month}-${dt.day}T${time}`, { zone: "UTC" }); };
  let arr = [];
  for (const t of tts) {
    const s = await repo.findStudingTime({ timetableId: t.timetableId, studingTimeDate: formatTime(t.timeStart) }, {}, { studingTimeDate: "asc" });
    // Need to include select fields similar to original
    arr.push(...s);
  }
  return arr;
}

async function getTimetableRoleStudent(studentId) {
  const dtNow = DateTime.now().setZone(zone).startOf("day");
  const stStart = DateTime.fromISO(`${dtNow.toString().split("T")[0]}T08:40:00`).setZone(zone);
  const stEnd = DateTime.fromISO(`${dtNow.toString().split("T")[0]}T15:30:00Z`).setZone(zone);
  if (!studentId) throw new AppError(400, "ข้อมูลไม่ถูกต้อง");
  const term = await repo.findAcademicTerm({ termStart: { lte: dtNow }, termEnd: { gte: dtNow } });
  if (!term) throw new AppError(500, "Internal server-side error");
  const cm = await repo.findClassroomMember({ stdId: studentId, classroom: { termId: term.termId }, deletedAt: null }, { classroom: true });
  if (!cm || !cm.classId) throw new AppError(404, "ไม่พบข้อมูลห้องเรียน");
  const tt = await repo.findTimetables({ classId: cm.classId, dayOfWeek: dtNow.weekday });
  return repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) }, studingTimeDate: { gte: stStart, lte: stEnd } }, { timetable: { include: { subject: { include: { teacher: true } }, classroom: true } } }, { studingTimeDate: "asc" });
}
