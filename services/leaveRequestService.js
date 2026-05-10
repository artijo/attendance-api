import { DateTime } from "luxon";
import { uploadFileToS3, generateSignedUrl } from "../libs/r2.js";
import { pushMassageWithImageToLine, pushMessageToLine } from "../helper/line.js";
import { formatTitle, getLastestTerm } from "../helper/helper.js";
import { AppError } from "../utils/AppError.js";
import * as repo from "../repositories/leaveRequestRepository.js";
const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getAllByStudentId = async (stdId) => repo.findMany({ stdId }, { leaveRequestType: true });
export const getAllTypes = async () => repo.findLeaveRequestTypes({ leaveRequest: true });

export const getStudingTimeByDate = async (stdId, date) => {
  let term = await repo.findTerms(); term = getLastestTerm(term);
  const cm = await repo.findClassroomMember({ stdId, classroom: { termId: term.termId } }, { classroom: { include: { term: true } } });
  if (!cm) throw new AppError(404, "Classroom not found");
  const d = new Date(date); const dow = d.getDay() === 0 ? 7 : d.getDay();
  const tt = await repo.findTimetables({ classId: cm.classroom.classId, dayOfWeek: dow });
  if (!tt || tt.length === 0) throw new AppError(404, "Timetable not found for this date");
  const ids = tt.filter(t => t && t.timetableId !== undefined).map(t => t.timetableId);
  if (ids.length === 0) throw new AppError(404, "No valid timetable IDs found");
  const start = new Date(new Date(d).setHours(0, 0, 0, 0)); const end = new Date(new Date(d).setHours(23, 59, 59, 999));
  return repo.findStudingTimeMany({ timetableId: { in: ids }, studingTimeDate: { gte: start, lte: end } }, { timetable: { include: { subject: true, classroom: true } } });
};

export const createLeaveRequest = async (stdId, data, file) => {
  const lr = await repo.create({ leaveRequestType: { connect: { leaveTypeId: data.leaveTypeId } }, student: { connect: { stdId } }, leaveDate: DateTime.fromJSDate(new Date(data.leaveDate)).toJSDate(), leaveReason: data.leaveReason });
  const records = data.studyTimeIds.map(id => ({ leaveId: lr.leaveId, studyTimeId: id }));
  await repo.createStudingTime(records);
  if (file) { const { fileName } = await uploadFileToS3(file, "nps"); await repo.update(lr.leaveId, { LeaveFile: fileName }); }
  if (data.tel) await repo.updateStudent(stdId, { tel: data.tel });
  const parents = await repo.findStudentParents(stdId);
  const lineIds = parents.map(p => p.parent.lineId).filter(Boolean);
  if (lineIds.length > 0) {
    const s = await repo.findStudent(stdId);
    for (const id of lineIds) {
      const msg = `${formatTitle(s.title)}${s.fName} ${s.lName} ได้ทำการขอลาเรียนในวันที่ ${data.leaveDate} เนื่องจาก ${data.leaveReason}`;
      const imgUrl = file ? await generateSignedUrl("nps", file.filename) : null;
      if (imgUrl) await pushMassageWithImageToLine(id, msg, imgUrl); else await pushMessageToLine(id, msg);
    }
  }
  return "Leave request created successfully";
};

export const getById = async (leaveId) => {
  let lr = await repo.findUnique(leaveId, { leaveRequestType: true, student: true, studingTime: { include: { teacherApprove: true, studingTime: { include: { timetable: { include: { subject: { include: { teacher: true } } } } } } } } });
  if (!lr) throw new AppError(404, "Leave request not found");
  if (lr.LeaveFile) lr.LeaveFile = await generateSignedUrl("nps", lr.LeaveFile);
  return lr;
};

export const getForTeacher = async (teacherId) => {
  const subs = await repo.findSubjects({ tchId: teacherId }, { subId: true });
  const ids = subs.map(s => s.subId);
  return repo.findMany({ studingTime: { some: { studingTime: { timetable: { subId: { in: ids } } } } } }, { leaveRequestType: true, student: true, studingTime: { include: { teacherApprove: true, studingTime: { include: { timetable: { include: { subject: true, classroom: true } } } } } } });
};

export const getForTeacherByLeaveId = async (leaveId) => {
  let lrs = await repo.findMany({ leaveId }, { leaveRequestType: true, student: true, studingTime: { include: { teacherApprove: true, studingTime: { include: { timetable: { include: { subject: { include: { teacher: true } }, classroom: true } } } } } } });
  if (!lrs || lrs.length === 0) throw new AppError(404, "Leave request not found");
  if (lrs[0].LeaveFile) lrs[0].LeaveFile = await generateSignedUrl("nps", lrs[0].LeaveFile);
  return lrs[0];
};

export const teacherUpdateStatus = async (studyTimeId, teacherId, status, rejectReason) => {
  const lr = await repo.findStudingTime({ leaveRequestStudingTimeId: studyTimeId }, { leaveRequest: true, studingTime: true });
  if (!lr) throw new AppError(404, "Leave request not found");
  const updated = await repo.updateStudingTime(studyTimeId, { teacherApprove: { connect: { tchId: teacherId } }, approverTimestamp: DateTime.now().setZone(zone).toJSDate(), leaveStatus: status.toUpperCase(), rejectedNote: rejectReason || null });
  if (status.toUpperCase() === "APPROVED") {
    const st = await repo.findStudingTimeUnique(lr.studyTimeId);
    if (!st) throw new AppError(404, "Studing time not found");
    const att = await repo.findAttendance({ stdId: lr.leaveRequest.stdId, studingTimeId: st.studyTimeId });
    const method = await repo.findAttendanceMethod({ attMethodName: "ระบบลา" });
    if (!method) throw new AppError(404, "Attendance method not found");
    if (att) {
      await repo.updateAttendance(att.attId, { attStatus: "LEAVE", attTimestamp: DateTime.now().setZone(zone).toJSDate(), attMethod: { connect: { attMethodId: method.attMethodId } }, operatedBy: "ระบบลา" });
      if (att.attStatus === "ABSENT" || att.attStatus === "LATE") {
        const score = att.attStatus === "ABSENT" ? 1 : 0.5;
        let term = await repo.findTerms(); term = getLastestTerm(term);
        await repo.createBehaviourTransaction({ student: { connect: { stdId: lr.leaveRequest.stdId } }, score, Status: "INCREMENT" });
        await repo.updateClassroomMembers({ stdId: lr.leaveRequest.stdId, classroom: { termId: term.termId } }, { behaviourScore: { increment: score } });
      }
    } else {
      await repo.createAttendance({ student: { connect: { stdId: lr.leaveRequest.stdId } }, studingTime: { connect: { studyTimeId: st.studyTimeId } }, attTimestamp: DateTime.now().setZone(zone).toJSDate(), attMethod: { connect: { attMethodId: method.attMethodId } }, attStatus: "LEAVE", operatedBy: "ระบบลา" });
    }
  }
  return updated;
};

export const getAllForAdmin = async () => repo.findMany({}, { leaveRequestType: true, student: true, studingTime: { include: { teacherApprove: true, studingTime: { include: { timetable: { include: { subject: { include: { teacher: true } }, classroom: true } } } } } } });

export const getForAdminByLeaveId = async (leaveId) => {
  let lrs = await repo.findMany({ leaveId }, { leaveRequestType: true, student: true, studingTime: { include: { teacherApprove: true, studingTime: { include: { timetable: { include: { subject: { include: { teacher: true } }, classroom: true } } } } } } });
  if (!lrs || lrs.length === 0) throw new AppError(404, "Leave request not found");
  if (lrs[0].LeaveFile) lrs[0].LeaveFile = await generateSignedUrl("nps", lrs[0].LeaveFile);
  return lrs[0];
};

export const cancelLeaveRequest = async (leaveId) => {
  await repo.deleteStudingTimes({ leaveId });
  await repo.remove(leaveId);
  return { message: "Leave request cancelled successfully" };
};
