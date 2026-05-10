import * as subjectService from "../services/subjectService.js";

export const createSubjectType = async (req, res) => { if (req.body) { try { res.json(await subjectService.createSubjectType(req.body)); } catch (err) { console.error(err); res.json(err); } } };
export const selectSubjectType = async (req, res) => { if (req.params.UUID) { try { res.json(await subjectService.selectSubjectType(req.params.UUID)); } catch (err) { console.error(err); res.status(404).json({ message: "Subject type not found" }); } } };
export const getAllSubjectType = async (req, res) => { try { res.json(await subjectService.getAllSubjectType()); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to fetch subject types", error: err.message }); } };
export const editSubjectType = async (req, res) => { if (req.body) { try { res.json(await subjectService.editSubjectType(req.params.uuid, req.body)); } catch (err) { console.error(err); res.json(err); } } };
export const deleteSubejectType = async (req, res) => { if (req.params.uuid) { try { return res.json(await subjectService.deleteSubjectType(req.params.uuid)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to delete subject type", error: err.message }); } } };

export const createSubject = async (req, res) => { if (req.body) { try { res.json(await subjectService.createSubject(req.body)); } catch (err) { console.error(err); res.json(err); } } };
export const editSubject = async (req, res) => { if (req.body) { try { res.json(await subjectService.editSubject(req.params.UUID, req.body)); } catch (err) { console.error(err); res.json(err); } } };
export const deleteSubject = async (req, res) => { if (req.params.UUID) { try { res.json(await subjectService.deleteSubject(req.params.UUID)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to delete subject", error: err.message }); } } };
export const getSubject = async (req, res) => { if (req.params.UUID) { try { res.json(await subjectService.getSubject(req.params.UUID)); } catch (err) { console.error(err); res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch subject", error: err.message }); } } };
export const getAllSubject = async (req, res) => { try { res.json(await subjectService.getAllSubject()); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to fetch subjects", error: err.message }); } };

export const getSubjectByTeacher = async (req, res) => { if (req.user) { try { res.json(await subjectService.getSubjectByTeacher(req.user.id)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to fetch subjects", error: err.message }); } } };
export const getSubjectByStudent = async (req, res) => {
  try { res.status(200).json(await subjectService.getSubjectByStudent(req.user.id, req.params.termId)); }
  catch (error) { console.error(error); return res.status(error.statusCode || 500).json({ message: error.message || "something happen on server-side" }); }
};

export const softDeleteSubject = async (req, res) => { if (req.params.uuid) { try { res.json(await subjectService.softDeleteSubject(req.params.uuid)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to soft delete subject", error: err.message }); } } };
export const restoreSubject = async (req, res) => { if (req.params.uuid) { try { res.json(await subjectService.restoreSubject(req.params.uuid)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to restore subject", error: err.message }); } } };
export const getSoftDeletedSubjects = async (req, res) => { try { res.json(await subjectService.getSoftDeletedSubjects()); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to fetch deleted subjects", error: err.message }); } };
export const softDeleteSubjectType = async (req, res) => { if (req.params.uuid) { try { return res.json(await subjectService.softDeleteSubjectType(req.params.uuid)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to soft delete subject type", error: err.message }); } } };
export const restoreSubjectType = async (req, res) => { if (req.params.uuid) { try { return res.json(await subjectService.restoreSubjectType(req.params.uuid)); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to restore subject type", error: err.message }); } } };
export const getSoftDeletedSubjectTypes = async (req, res) => { try { res.json(await subjectService.getSoftDeletedSubjectTypes()); } catch (err) { console.error(err); res.status(500).json({ message: "Failed to fetch deleted subject types", error: err.message }); } };
