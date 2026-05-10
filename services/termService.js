import { DateTime } from "luxon";
import { CheckDateBetween, daybetween } from "../helper/helper.js";
import { AppError } from "../utils/AppError.js";
import * as termRepository from "../repositories/termRepository.js";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getAllAcademicTerms = async () => {
  return termRepository.findAll([{ academicYear: "asc" }, { semester: "asc" }]);
};

export const getTermDateBetweenFilterHolidays = async (termId) => {
  if (!termId) throw new AppError(400, "bad requset");
  const term = await termRepository.findUnique(termId);
  const holidays = await termRepository.findHolidays(termId);
  const holidayListDate = holidays.map((h) => DateTime.fromJSDate(h.startHolidayDate, { zone }).toISODate());
  const termStart = DateTime.fromJSDate(term.termStart, { zone }).toISODate();
  const termEnd = DateTime.fromJSDate(term.termEnd, { zone }).toISODate();
  return daybetween(termStart, termEnd)
    .filter((date) => { const wd = DateTime.fromISO(date, { zone }).weekday; return wd !== 6 && wd !== 7; })
    .filter((date) => !holidayListDate.includes(date));
};

export const getOneAcademicTerm = async (termId) => {
  return termRepository.findById(termId, { holiday: true });
};

export const createTerm = async (body) => {
  const academicYear = parseInt(body.academicYear) - 543;
  const semester = parseInt(body.semester);
  const termStart = DateTime.fromISO(`${body.termStart}T00:00:00`).setZone(zone);
  const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00`).setZone(zone);
  if (!academicYear || !semester || !termStart || !termEnd) throw new AppError(400, "กรุณากรอกข้อมูลให้ถูกต้องหรือครบถ้วน");
  const existing = await termRepository.findByYearSemester(academicYear, semester);
  if (existing) throw new AppError(400, "ไม่สามารถสร้างเทอมปีการศึกษาได้เนื่องจากมีปีการศึกษาและเทอมนี้อยู่แล้ว");
  const min = await termRepository.findMinTermStart();
  const max = await termRepository.findMaxTermEnd();
  if (min && max) {
    if (CheckDateBetween(min.termStart, max.termEnd, termStart, termEnd))
      throw new AppError(400, "ไม่สามารถสร้างเทอมปีการศึกษาได้เนื่องจากมีระหว่างวันที่มีอยู่ในฐานข้อมูลแล้ว");
  }
  await termRepository.create({ academicYear, semester, termStart, termEnd });
  return { message: "สร้างเทอมปีการศึกษาสำเร็จ" };
};

export const updateTerm = async (body) => {
  const termId = body.termId;
  const academicYear = parseInt(body.academicYear) - 543;
  const semester = parseInt(body.semester);
  const termStart = DateTime.fromISO(`${body.termStart}T00:00:00`).setZone(zone);
  const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00`).setZone(zone);
  if (!body) throw new AppError(400, "กรุณากรอกข้อมูลให้ถูกต้องหรือครบถ้วน");
  const overlapping = await termRepository.findOverlapping(termStart, termEnd);
  if (overlapping.length > 1) throw new AppError(400, "ไม่สามารถแก้ไขเทอมได้เนื่องจากมีวันของวันที่เลือกทับซ้อนกับเทอมอื่น");
  if (overlapping.length === 1) {
    if (overlapping[0].termId !== termId) throw new AppError(400, "ไม่สามารถแก้ไขเทอมได้เนื่องจากมีวันของวันที่เลือกทับซ้อนกับเทอมอื่น");
  }
  await termRepository.update(termId, { academicYear, semester, termStart, termEnd });
  return { message: "แก้ไขปีการศึกษาสำเร็จ" };
};

export const deleteTerm = async (termId) => {
  const term = await termRepository.remove(termId);
  return { message: `ลบ ปีการศึกษา${term.academicYear} เทอม ${term.semester} สำเร็จ` };
};

export const getTermByStudent = async (studentId) => {
  if (!studentId) throw new AppError(400, "id not found");
  const classRoomMember = await termRepository.findClassroomMembersByStudent(studentId);
  return classRoomMember
    .map((m) => m.classroom.term)
    .sort((a, b) => a.termStart - b.termStart);
};
