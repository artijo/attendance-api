import * as svc from "../services/attendanceService.js";

export const isEnrollment = async (req, res) => {
  try { return res.status(200).json(await svc.isEnrollment(req.user.id, req.body.enrollmentInfo)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const getSubjectTimetableByClassroom = async (req, res) => {
  if (req.query.classroom) { try { res.json(await svc.getSubjectTimetableByClassroom(req.query.classroom)); } catch (e) { console.error(e); } }
};

export const getAttendenceBySubject = async (req, res) => {
  if (req.params.subjectId) { try { res.json(await svc.getAttendenceBySubject(req.params.subjectId, req.params.classroomId)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); } }
};

export const getAttendenceByDateAndStudnet = async (req, res) => {
  try { res.json(await svc.getAttendenceByDateAndStudnet(req.params.studentId, req.params.studingTimeId)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const getAttendenceByDate = async (req, res) => {
  try { res.json(await svc.getAttendenceByDate(req.params.studingTimeId)); }
  catch (e) { console.error(e); }
};

export const getAttendenceSummaryByClassroom = async (req, res) => {
  try { res.json(await svc.getAttendenceSummaryByClassroom(req.params.classId)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const getAttendenceSummaryBySubjectIsExam = async (req, res) => {
  try { res.json(await svc.getAttendenceSummaryBySubjectIsExam(req.params.subjectId, req.params.classroomId)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const getAttendenceSummaryByPerson = async (req, res) => {
  try { res.json(await svc.getAttendenceSummaryByPerson(req.params.studentId, req.params.subjectId, req.params.classroomId)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const saveAttendenceByTeacher = async (req, res) => {
  try { res.json(await svc.saveAttendenceByTeacher(req.body)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const saveAttendenceByLeader = async (req, res) => {
  try { res.json(await svc.saveAttendenceByLeader(req.body)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const abstactAttendenceBySubject = async (req, res) => {
  try { res.json(await svc.abstactAttendenceBySubject(req.params.subjectId, req.params.classroomId)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const studentAttendenceEnrollment = async (req, res) => {
  try { res.json(await svc.studentAttendenceEnrollment(req.user.id, req.body)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const generateLinkAttendanceForQR = async (req, res) => {
  try { res.json(await svc.generateLinkAttendanceForQR(req.body.studyTimeId, req.user.id)); }
  catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

export const saveAttendenceByStudentWithQR = async (req, res) => {
  try { res.json(await svc.saveAttendenceByStudentWithQR(req.user.id, req.body.token)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const summarzieAttendenceByDateStudent = async (req, res) => {
  try { res.json(await svc.summarzieAttendenceByDateStudent(req.user.id, req.params.classroomId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};

export const summarzieAttendenceBySubject = async (req, res) => {
  try { res.json(await svc.summarzieAttendenceBySubject(req.user.id, req.params.subjectId, req.params.classroomId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
