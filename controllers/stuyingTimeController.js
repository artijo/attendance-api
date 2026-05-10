import * as svc from "../services/studyingTimeService.js";

export const getFullCalendarStudyTime = async (req, res) => {
  try { res.json(await svc.getFullCalendarStudyTime(req.params.classroomId)); }
  catch (e) { console.error(e); }
};

export const getStuydingTimeById = async (req, res) => {
  try { res.json(await svc.getStudyingTimeById(req.params.UUID)); }
  catch (e) { console.error(e); return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการเรียน" }); }
};
