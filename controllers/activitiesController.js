import * as svc from "../services/activityService.js";

export const getAllActivitiesByType = async (req, res) => {
  try { res.json(await svc.getAllActivitiesByType(req.params.type)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getActivity = async (req, res) => {
  try { res.json(await svc.getActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityType = async (req, res) => {
  try { res.json(await svc.getActivityType()); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const createActivity = async (req, res) => {
  try { res.json(await svc.createActivity(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const editActivity = async (req, res) => {
  try { res.json(await svc.editActivity(req.params.uuid, req.body)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getActivityByTeacher = async (req, res) => {
  try { res.json(await svc.getActivityByTeacher(req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const paticipatedActivityByteacher = async (req, res) => {
  try { res.json(await svc.paticipatedActivityByteacher(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const abstactActivityClassroom = async (req, res) => {
  try { res.json(await svc.abstactActivityClassroom(req.params.activityId)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const abstactActivityFilterByRoom = async (req, res) => {
  try { res.json(await svc.abstactActivityFilterByRoom(req.params.activityId, req.params.classId)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const generateLinkActivityForQR = async (req, res) => {
  try { res.json(await svc.generateLinkActivityForQR(req.body.actId, req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const saveActivityByStudentWithQR = async (req, res) => {
  try { res.json(await svc.saveActivityByStudentWithQR(req.user.id, req.body.token)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityByLeader = async (req, res) => {
  try { res.json(await svc.getActivityByLeader(req.user.id)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const paticipatedActivityByLeader = async (req, res) => {
  try { res.json(await svc.paticipatedActivityByLeader(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityStudent = async (req, res) => {
  try { res.json(await svc.getActivityStudent(req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const activityCheckIn = async (req, res) => {
  try { res.json(await svc.activityCheckIn(req.user.id, req.body.actId)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const isActivityThisTimeCheckIn = async (req, res) => {
  try { res.json(await svc.isActivityThisTimeCheckIn(req.user.id, req.params.activityId)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const activityHistoryStudent = async (req, res) => {
  try { res.json(await svc.activityHistoryStudent(req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const softDeleteActivity = async (req, res) => {
  try { res.json(await svc.softDeleteActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getsoftDeletedActivity = async (req, res) => {
  try { res.json(await svc.getSoftDeletedActivities()); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const restoreSoftDeletedActivity = async (req, res) => {
  try { res.json(await svc.restoreSoftDeletedActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
