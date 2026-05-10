import { DateTime } from "luxon";
import { fecthHolidayDateTime } from "../helper/holidayApi.js";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/holidayRepository.js";
const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const fullCalendarHoliday = async (classroomId) => {
  const classroom = await repo.findClassroom(classroomId);
  const holidays = await repo.findMany({ termId: classroom.termId }, [{ startHolidayDate: "asc" }]);
  return holidays.map(h => ({ title: h.holidayName, start: DateTime.fromJSDate(h.startHolidayDate).setZone(zone), end: DateTime.fromJSDate(h.endHolidayDate).setZone(zone), allDay: true, holidayType: h.type }));
};
export const getHolidayList = async (termId) => repo.findMany({ termId }, [{ startHolidayDate: "asc" }]);
export const deleteHoliday = async (holidayId) => { if (!holidayId) throw new AppError(400, "ไม่มีวันหยุดนี้อยู่ในระบบ"); const h = await repo.remove(holidayId); return { message: `ลบ ${h.holidayName} สำเร็จ` }; };
export const getOneHoliday = async (holidayId) => repo.findUnique(holidayId);
export const updateHoliday = async (holidayId, body) => { if (!body) throw new AppError(400, "กรุณาใส่ข้อมูลให้ครบถ้วน"); const d = DateTime.fromISO(`${body.startHolidayDate}T00:00:00`).setZone(zone); await repo.update(holidayId, { holidayName: body.holidayName, startHolidayDate: d, endHolidayDate: d, type: body.type }); return { message: "แก้ไขวันหยุดสำเร็จ" }; };
export const getHolidayListAuto = async () => fecthHolidayDateTime();

export const createHoliday = async (body) => {
  if (!body) throw new AppError(400, "กรุณากรอกข้อมูลให้ครบถ้วน");
  const { termId, holidayList } = body;
  const studyTime = await repo.findStudingTimeByTerm(termId);
  const haveAtt = studyTime.map(s => { const d = DateTime.fromJSDate(s.studingTimeDate).setZone(zone).toFormat("yyyy-MM-dd"); return s.attendance.length > 0 ? d : undefined; });
  const filtered = holidayList.filter(h => { const d = DateTime.fromISO(h.startDate + "T00:00:00").setZone(zone).toFormat("yyyy-MM-dd"); return !haveAtt.includes(d); });
  if (filtered.length === 0) throw new AppError(400, "ไม่สามารถสร้างวันหยุดได้เนื่องจากมีวันหยุดบางอันตรงกับวันที่เรียนและวันที่เรียนมีการเช็คชื่่อเข้าเรียนแล้ว");
  const dtList = filtered.map(d => ({ dateStart: DateTime.fromISO(d.startDate + "T00:00:00").setZone(zone), dateEnd: DateTime.fromISO(d.endDate + "T23:59:00").setZone(zone) }));
  for (const d of dtList) { const st = await repo.findStudingTimeByDateRange(new Date(d.dateStart), new Date(d.dateEnd)); for (const s of st) await repo.deleteStudingTime(s.studyTimeId); }
  for (const h of filtered) { await repo.create({ holidayName: h.holidayname, startHolidayDate: DateTime.fromISO(h.startDate + "T00:00:00").setZone(zone), endHolidayDate: DateTime.fromISO(h.endDate + "T00:00:00").setZone(zone), type: h.type, term: { connect: { termId } } }); }
  return { message: "สร้างรายการวันหยุดสำเร็จ" };
};
