import { DateTime } from "luxon";
import { pushMessageToLine } from "../helper/line.js";
import { formatTitle, formateAttendanceStatus } from "../helper/helper.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/attendanceRepository.js";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const isEnrollment = async (studentId, enrollmentInfo) => {
  if (!studentId || !enrollmentInfo) throw new AppError(401, "มีบางอย่างผิดพลาด");
  const att = await repo.findAttendance({ studingTimeId: enrollmentInfo.studyTimeId, stdId: studentId });
  return { isFound: att != null ? 1 : 0 };
};

export const getSubjectTimetableByClassroom = async (classId) =>
  repo.findTimetables({ classId }, [], { subId: true, subject: true });

export const getAttendenceBySubject = async (subjectId, classroomId) => {
  const tt = await repo.findTimetables({ AND: { subId: subjectId, classId: classroomId } }, [{ dayOfWeek: "asc" }, { timeStart: "asc" }]);
  const student = await repo.findClassroomMembers({ classId: classroomId }, { stdId: true, stdNo: true, student: { select: { fName: true, lName: true, attendance: true, title: true } } }, { stdNo: "asc" });
  const st = await repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, { attendance: { include: { student: true, attMethod: true } }, timetable: true }, { studingTimeDate: "asc" });
  return { student, stuidingTime: st };
};

export const getAttendenceByDateAndStudnet = async (studentId, studingTimeId) =>
  (await repo.findAttendance({ stdId: studentId, studingTimeId })) || { message: "ไม่พบข้อมูลการเช็คชื่อ" };

export const getAttendenceByDate = async (studingTimeId) =>
  repo.findManyAttendance({ studingTimeId }, { student: true, attMethod: true });

export const getAttendenceSummaryByClassroom = async (classId) =>
  repo.findClassroomMembers({ classId }, { stdId: true, stdNo: true, student: { select: { fName: true, lName: true, title: true, attendance: true } } }, { stdNo: "asc" });

export const getAttendenceSummaryBySubjectIsExam = async (subjectId, classroomId) => {
  const tt = await repo.findTimetables({ AND: { subId: subjectId, classId: classroomId } });
  const st = await repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, {}, { studingTimeDate: "asc" });
  const ids = st.map(s => s.studyTimeId);
  const members = await repo.findClassroomMembers({ classId: classroomId }, {
    stdId: true, stdNo: true,
    student: { select: { fName: true, lName: true, title: true, attendance: { where: { studingTimeId: { in: ids } }, include: { attMethod: true } } } }
  }, { stdNo: "asc" });
  const total = ids.length;
  return members.map(m => {
    const abs = m.student.attendance.filter(a => a.attStatus === "ABSENT").length;
    const late = m.student.attendance.filter(a => a.attStatus === "LATE").length;
    const leave = m.student.attendance.filter(a => a.attStatus === "LEAVE").length;
    const present = m.student.attendance.filter(a => a.attStatus === "PRESENT").length;
    const pct = total > 0 ? ((present + late + leave) / total) * 100 : 0;
    return { stdId: m.stdId, stdNo: m.stdNo, fName: m.student.fName, lName: m.student.lName, title: m.student.title, totalStudyTime: total, attCount: m.student.attendance.length, absCount: abs, lateCount: late, leaveCount: leave, presentCount: present, percentage: Math.round(pct * 100) / 100, isExamEligible: pct >= 80 };
  });
};

export const getAttendenceSummaryByPerson = async (studentId, subjectId, classroomId) => {
  const tt = await repo.findTimetables({ AND: { subId: subjectId, classId: classroomId } });
  return repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, { attendance: { where: { stdId: studentId }, include: { student: true, attMethod: true } }, timetable: { include: { subject: true } } }, { studingTimeDate: "asc" });
};

async function handleScore(stdId, oldStatus, newStatus, termId, studingTimeId) {
  const sm = { ABSENT: 1, LATE: 0.5 };
  if (sm[oldStatus] && (oldStatus !== newStatus)) {
    await repo.createBehaviourScoreTransaction({ student: { connect: { stdId } }, studingTime: { connect: { studyTimeId: studingTimeId } }, score: sm[oldStatus], Status: "INCREMENT" });
    await repo.updateManyClassroomMembers({ stdId, classroom: { termId } }, { behaviourScore: { increment: sm[oldStatus] } });
  }
  if (sm[newStatus] && (oldStatus !== newStatus)) {
    await repo.createBehaviourScoreTransaction({ student: { connect: { stdId } }, studingTime: { connect: { studyTimeId: studingTimeId } }, score: sm[newStatus], Status: "DECREMENT" });
    await repo.updateManyClassroomMembers({ stdId, classroom: { termId } }, { behaviourScore: { decrement: sm[newStatus] } });
  }
}

async function sendNotifications(list, studingTime) {
  for (const att of list.filter(a => a.attStatus === "ABSENT" || a.attStatus === "LATE")) {
    try {
      const s = await repo.findStudent(att.stdId);
      const p = await repo.findStudentParents(att.stdId);
      const ids = p.map(x => x.parent.lineId).filter(Boolean);
      if (ids.length > 0 && s) {
        const msg = `แจ้งเตือน: ${formatTitle(s.title)}${s.fName} ${s.lName} ${formateAttendanceStatus(att.attStatus)} วิชา${studingTime.timetable.subject?.subNameThai || "ไม่ระบุ"}`;
        for (const id of ids) await pushMessageToLine(id, msg);
      }
    } catch (e) { console.error("LINE error:", e); }
  }
}

async function processAttendanceList(studingTimeId, attendanceList, methodName) {
  const method = await repo.findAttendanceMethod({ attMethodName: methodName });
  const st = await repo.findStudingTimeUnique(studingTimeId, { timetable: { include: { subject: true, classroom: { include: { term: true } } } } });
  if (!st) throw new AppError(404, "ไม่พบข้อมูลเวลาเรียน");
  const termId = st.timetable.classroom.term.termId;
  for (const att of attendanceList) {
    const existing = await repo.findAttendance({ stdId: att.stdId, studingTimeId });
    if (existing) {
      const old = existing.attStatus;
      await repo.updateAttendance(existing.attId, { attStatus: att.attStatus, attTimestamp: DateTime.now().setZone(zone).toJSDate(), attMethod: { connect: { attMethodId: method.attMethodId } }, operatedBy: methodName });
      if (old !== att.attStatus) await handleScore(att.stdId, old, att.attStatus, termId, studingTimeId);
    } else {
      await repo.createAttendance({ student: { connect: { stdId: att.stdId } }, studingTime: { connect: { studyTimeId: studingTimeId } }, attTimestamp: DateTime.now().setZone(zone).toJSDate(), attMethod: { connect: { attMethodId: method.attMethodId } }, attStatus: att.attStatus, operatedBy: methodName });
      if (att.attStatus === "ABSENT" || att.attStatus === "LATE") { const sc = att.attStatus === "ABSENT" ? 1 : 0.5; await repo.createBehaviourScoreTransaction({ student: { connect: { stdId: att.stdId } }, studingTime: { connect: { studyTimeId: studingTimeId } }, score: sc, Status: "DECREMENT" }); await repo.updateManyClassroomMembers({ stdId: att.stdId, classroom: { termId } }, { behaviourScore: { decrement: sc } }); }
    }
  }
  await sendNotifications(attendanceList, st);
  return { message: "บันทึกการเช็คชื่อสำเร็จ" };
}

export const saveAttendenceByTeacher = async (body) => {
  if (!body.studingTimeId || !body.attendanceList) throw new AppError(400, "ข้อมูลไม่ครบถ้วน");
  return processAttendanceList(body.studingTimeId, body.attendanceList, body.attendanceType || "ครูเช็คชื่อ");
};

export const saveAttendenceByLeader = async (body) => {
  if (!body.studingTimeId || !body.attendanceList) throw new AppError(400, "ข้อมูลไม่ครบถ้วน");
  return processAttendanceList(body.studingTimeId, body.attendanceList, "หัวหน้าเช็คชื่อ");
};

export const abstactAttendenceBySubject = async (subjectId, classroomId) => {
  const tt = await repo.findTimetables({ AND: { subId: subjectId, classId: classroomId } });
  const st = await repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, {}, { studingTimeDate: "asc" });
  return repo.findClassroomMembers({ classId: classroomId }, { stdId: true, stdNo: true, student: { select: { fName: true, lName: true, title: true, attendance: { where: { studingTimeId: { in: st.map(s => s.studyTimeId) } } } } } }, { stdNo: "asc" });
};

async function qrEnroll(studentId, studyTimeId, methodName) {
  const st = await repo.findStudingTimeUnique(studyTimeId, { timetable: { include: { subject: true, classroom: { include: { term: true } } } } });
  if (!st) throw new AppError(404, "ไม่พบข้อมูลเวลาเรียน");
  const existing = await repo.findAttendance({ stdId: studentId, studingTimeId: studyTimeId });
  if (existing) throw new AppError(400, "เช็คชื่อไปแล้ว");
  const method = await repo.findAttendanceMethod({ attMethodName: methodName });
  const now = DateTime.now().setZone(zone);
  const studyDate = DateTime.fromJSDate(st.studingTimeDate).setZone(zone);
  let attStatus = "PRESENT";
  if (st.timetable.timeLate) { const lt = DateTime.fromISO(`${studyDate.toISODate()}T${st.timetable.timeLate}`).setZone(zone); if (now > lt) attStatus = "LATE"; }
  await repo.createAttendance({ student: { connect: { stdId: studentId } }, studingTime: { connect: { studyTimeId } }, attTimestamp: now.toJSDate(), attMethod: { connect: { attMethodId: method.attMethodId } }, attStatus, operatedBy: methodName });
  if (attStatus === "LATE") { const termId = st.timetable.classroom.term.termId; await repo.createBehaviourScoreTransaction({ student: { connect: { stdId: studentId } }, studingTime: { connect: { studyTimeId } }, score: 0.5, Status: "DECREMENT" }); await repo.updateManyClassroomMembers({ stdId: studentId, classroom: { termId } }, { behaviourScore: { decrement: 0.5 } }); }
  return { message: `เช็คชื่อสำเร็จ สถานะ: ${formateAttendanceStatus(attStatus)}`, attStatus };
}

export const studentAttendenceEnrollment = async (studentId, body) => {
  if (!body.studyTimeId || !studentId) throw new AppError(400, "ข้อมูลไม่ครบถ้วน");
  return qrEnroll(studentId, body.studyTimeId, "นักเรียนเช็คชื่อ");
};

export const generateLinkAttendanceForQR = async (studyTimeId, teacherId) => {
  const token = generateToken({ studyTimeId, teacherId }, "30m");
  return { linkUrl: `${process.env.STUDENT_WEB_CLIENT}/attendence/qr?token=${token}`, token };
};

export const saveAttendenceByStudentWithQR = async (studentId, token) => {
  if (!token) throw new AppError(400, "ไม่พบ Token");
  const decoded = verifyToken(token);
  if (!decoded) throw new AppError(401, "Token ไม่ถูกต้องหรือหมดอายุ");
  return qrEnroll(studentId, decoded.studyTimeId, "QR Code");
};

export const summarzieAttendenceByDateStudent = async (studentId, classroomId) => {
  if (!studentId) throw new AppError(400, "ไม่พบรหัสนักเรียน");
  const tt = await repo.findTimetables({ classId: classroomId });
  return repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, { attendance: { where: { stdId: studentId }, include: { attMethod: true } }, timetable: { include: { subject: true } } }, { studingTimeDate: "asc" });
};

export const summarzieAttendenceBySubject = async (studentId, subjectId, classroomId) => {
  if (!studentId) throw new AppError(400, "ไม่พบรหัสนักเรียน");
  const tt = await repo.findTimetables({ AND: { subId: subjectId, classId: classroomId } });
  return repo.findStudingTime({ timetableId: { in: tt.map(t => t.timetableId) } }, { attendance: { where: { stdId: studentId }, include: { attMethod: true } }, timetable: { include: { subject: true } } }, { studingTimeDate: "asc" });
};
