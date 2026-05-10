import * as svc from "../services/timetableService.js";

export const createTimetableByAddSubject = async (req, res) => {
  try { return res.status(200).json(await svc.createTimetableByAddSubject(req.body)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "เกิดข้อผิดพลาด" }); }
};
export const createTimetableBySwitchPeriod = async (req, res) => {
  console.log('kuy');
  try { return res.status(200).json(await svc.createTimetableBySwitchPeriod(req.body)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "เกิดข้อผิดพลาด" }); }
};
export const createTimetableBySwitchSubjectAndSubject = async (req, res) => {
  try { return res.status(200).json(await svc.createTimetableBySwitchSubjectAndSubject(req.body)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "เกิดข้อผิดพลาด" }); }
};
export const createTimetable = async (req, res) => {
  try { return res.status(200).json(await svc.createTimetable(req.body)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "เกิดข้อผิดพลาดในขณะสร้างคาบตารางเรียน" }); }
};
export const editTimelateTimetable = async (req, res) => {
  try { return res.status(200).json(await svc.editTimelateTimetable(req.body)); }
  catch (e) { return res.status(e.statusCode || 400).json({ message: e.message || "ข้อมูลไม่ถูกต้อง" }); }
};
export const getTimeTableByRoom = async (req, res) => {
  try { res.json(await svc.getTimeTableByRoom(req.query.classroomid)); }
  catch (e) { console.log(e); res.status(e.statusCode || 500).json({ error: e.message || "error qurey timetable." }); }
};
export const deleteTimetable = async (req, res) => {
  if (req.params.timetableId) { try { res.json(await svc.deleteTimetableService(req.params.timetableId)); } catch (e) { console.error(e); } }
};
export const getSubjectTimetable = async (req, res) => {
  if (req.params.classroomId) { try { res.json(await svc.getSubjectTimetable(req.params.classroomId)); } catch (e) { console.error(e); } }
};
export const getTimeTable = async (req, res) => {
  if (req.params.classroomId && req.params.dayOfWeek) { try { res.json(await svc.getTimeTable(req.params.classroomId, req.params.dayOfWeek)); } catch (e) { console.error(e); } }
  else console.log("pls enter params");
};
export const getTimetableRoleStudent = async (req, res) => {
  try { return res.status(200).json(await svc.getTimetableRoleStudent(req.user.id)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "เกิดข้อผิดพลาด" }); }
};
