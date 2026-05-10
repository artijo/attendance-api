import * as svc from "../services/parentService.js";

export async function createParent(req, res) {
  try { res.status(201).json(await svc.createParent(req.body.userId, req.body.displayName)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getallStudentParent(req, res) {
  try { res.status(200).json(await svc.getAllStudentParent(req.params.userId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function studentLookup(req, res) {
  try { res.status(200).json(await svc.studentLookup(req.params.studentId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function addStudentParent(req, res) {
  try { res.status(201).json(await svc.addStudentParent(req.body.studentId, req.body.userId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function deleteStudentParent(req, res) {
  try { res.status(200).json(await svc.deleteStudentParent(req.body.studentId, req.body.userId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getParentByLineId(req, res) {
  try { res.status(200).json(await svc.getParentByLineId(req.params.userId)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function updateParent(req, res) {
  try { res.status(200).json(await svc.updateParent(req.body.userId, req.body.name, req.body.email, req.body.tel)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
export async function getAllParent(req, res) {
  try { res.status(200).json(await svc.getAllParent()); }
  catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
}
export async function getParentById(req, res) {
  try { res.status(200).json(await svc.getParentById(req.params.id)); }
  catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message || "Internal server error" }); }
}
