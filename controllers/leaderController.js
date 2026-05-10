import * as svc from "../services/leaderService.js";

export function getAllLeaders(req, res) {
  try { svc.getAllLeaders().then(r => res.json(r)); } catch (e) { console.error(e); }
}
export async function getClassroomBystdId(req, res) {
  try { return res.json(await svc.getClassroomByStdId(req.user.id)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getClassroomMembersByClassroomId(req, res) {
  try { return res.json(await svc.getClassroomMembersByClassroomId(req.params.classId)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getTimeTableandStudytimeByClassId(req, res) {
  try { return res.json(await svc.getTimeTableAndStudyTime(req.params.classId)); }
  catch (e) { console.error(e); return res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export const getStuydingTimeById = async (req, res) => {
  try { res.json(await svc.getStudyingTimeById(req.params.studingTimeId)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการเรียน" }); }
};
