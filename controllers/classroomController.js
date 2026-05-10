import * as classroomService from "../services/classroomService.js";

export const createClassroom = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.createClassroom(req.body)); }
    catch (err) { console.error(err); }
  }
};

export const updateClassroom = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.updateClassroom(req.body)); }
    catch (err) { console.error(err); return res.status(err.statusCode || 500).json({ message: err.message || "Update Classroom Failed", error: err.message }); }
  }
};

export const getAllClassroom = async (req, res) => {
  try { return res.json(await classroomService.getAllClassroom(req.query.noMembers)); }
  catch (error) { return res.status(500).json({ message: "Error fetching classrooms", error: error.message }); }
};

export const getClassroom = async (req, res) => {
  try { return res.status(200).json(await classroomService.getClassroom(req.params.uuid)); }
  catch (error) { console.error(error); return res.status(error.statusCode || 500).json({ message: "Error fetching classroom", error: error.message }); }
};

export const getAllClassroomType = async (req, res) => {
  try { res.json(await classroomService.getAllClassroomType()); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Error fetching classroom types", error: error.message }); }
};

export const createClassroomType = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.createClassroomType(req.body)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Create Classroom Type Failed", error: err.message }); }
  }
};

export const updateClassroomType = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.updateClassroomType(req.params.uuid, req.body)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Update Classroom Type Failed", error: err.message }); }
  }
};

export const deleteClassroomType = async (req, res) => {
  if (req.params.uuid) {
    try { return res.json(await classroomService.deleteClassroomType(req.params.uuid)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Delete Classroom Type Failed", error: err.message }); }
  }
};

export const createClassroomMember = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.createClassroomMember(req.body)); }
    catch (err) { console.error(err); return res.status(err.statusCode || 500).json({ message: err.message || "Create Classroom Member Failed", error: err.message }); }
  }
};

export const updateClassroomMember = async (req, res) => {
  if (req.body) {
    try { return res.json(await classroomService.updateClassroomMember(req.params.uuid, req.body)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Update Classroom Member Failed", error: err.message }); }
  }
};

export const deleteClassroomMember = async (req, res) => {
  if (req.params.uuid) {
    try { res.json(await classroomService.deleteClassroomMember(req.params.uuid)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Delete Classroom Member Failed", error: err.message }); }
  }
};

export const getClassroomByAcademicYearTerm = async (req, res) => {
  if (req.params.termId) {
    try { res.json(await classroomService.getClassroomByAcademicYearTerm(req.params.termId)); }
    catch (err) { console.error(err); res.status(500).json({ message: "Error fetching classrooms by academic year term", error: err.message }); }
  }
};

export const getAcademicYearClassroom = async (req, res) => {
  try { res.json(await classroomService.getAcademicYearClassroom()); }
  catch (err) { console.error(err); res.status(500).json({ message: "Error fetching academic year classrooms", error: err.message }); }
};

export const getClassroomFilterByAcademicYearAndLevel = async (req, res) => {
  try { res.json(await classroomService.getClassroomFilterByAcademicYearAndLevel(req.params.academicYear, req.params.classroomLevel)); }
  catch (err) { console.error(err); res.status(500).json({ message: "Error fetching classrooms by academic year and level", error: err.message }); }
};

export const getTeacherAdvisorClassroom = async (req, res) => {
  try { res.status(200).json(await classroomService.getTeacherAdvisorClassroom(req.user.id)); }
  catch (error) { console.log(error); return res.status(500).json({ message: "เกิดข้อผิดพลาดบางอย่างบน Server", error: error.message }); }
};

export const getClassroomByClassAndSubject = async (req, res) => {
  try { res.status(200).json(await classroomService.getClassroomByClassAndSubject(req.params.subjectId, req.params.termId)); }
  catch (error) { res.status(501).json("เกิดข้อผิดพลาดบางอย่างบน Server"); console.error(error); }
};

export const softDeleteClassroom = async (req, res) => {
  if (req.params.uuid) {
    try { return res.json(await classroomService.softDeleteClassroom(req.params.uuid)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Error soft deleting classroom", error: err.message }); }
  }
};

export const restoreClassroom = async (req, res) => {
  if (req.params.uuid) {
    try { return res.json(await classroomService.restoreClassroom(req.params.uuid)); }
    catch (err) { console.error(err); return res.status(500).json({ message: "Error restoring classroom", error: err.message }); }
  }
};

export const getDeletedClassrooms = async (req, res) => {
  try { return res.json(await classroomService.getDeletedClassrooms()); }
  catch (err) { console.error(err); return res.status(500).json({ message: "Error fetching deleted classrooms", error: err.message }); }
};
