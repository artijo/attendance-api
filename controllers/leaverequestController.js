import * as svc from "../services/leaveRequestService.js";

export async function getAllLeaveRequestsByStudentId(req, res) {
  try { return res.json(await svc.getAllByStudentId(req.user.id)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
export async function getAllLeaveRequestsType(req, res) {
  try { return res.json(await svc.getAllTypes()); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
export async function getStudingTimeByDate(req, res) {
  try { return res.json(await svc.getStudingTimeByDate(req.user.id, req.params.date)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function CreateLeaveRequest(req, res) {
  try { return res.status(201).json(await svc.createLeaveRequest(req.user.id, req.body, req.file)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
export async function getLeaveRequestById(req, res) {
  try { return res.json(await svc.getById(req.params.id)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getLeaveRequestForTeacher(req, res) {
  try { return res.json(await svc.getForTeacher(req.user.id)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
export async function getLeaveRequestForTeacherByleaveRequestStudingTimeId(req, res) {
  try { return res.json(await svc.getForTeacherByLeaveId(req.params.id)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function teacherUpdateStatusLeaveRequest(req, res) {
  try { return res.json(await svc.teacherUpdateStatus(req.params.id, req.user.id, req.body.action, req.body.rejectReason)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getAllLeaveRequestForAdmin(req, res) {
  try { return res.json(await svc.getAllForAdmin()); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
export async function getLeaveRequestForAdminByLeaveId(req, res) {
  try { return res.json(await svc.getForAdminByLeaveId(req.params.id)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function cancelLeaveRequest(req, res) {
  try { return res.status(200).json(await svc.cancelLeaveRequest(req.params.id)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "Internal server error" }); }
}
