import * as termService from "../services/termService.js";

export const getAllAcademicTerms = async (req, res) => {
  try { res.status(200).json(await termService.getAllAcademicTerms()); }
  catch (error) { res.status(501).json({ message: "มีบางอย่างผิดพลาดบน Server" }); console.error(error); }
};

export const getTermDateBetweenFilterHolidays = async (req, res) => {
  try { return res.status(200).send(await termService.getTermDateBetweenFilterHolidays(req.params.termId)); }
  catch (err) { console.error(err); return res.status(err.statusCode || 500).send({ message: err.message || "เกิดข้อผิดพลาดบางอย่างที่ server" }); }
};

export const getOneAcademicTerm = async (req, res) => {
  if (req.params.termId) {
    try { res.json(await termService.getOneAcademicTerm(req.params.termId)); }
    catch (error) { console.error(error); }
  }
};

export const createTerm = async (req, res) => {
  try { res.status(200).json(await termService.createTerm(req.body)); }
  catch (error) { console.error(error); res.status(error.statusCode || 500).json({ message: error.message || "Error: เกิดข้อผิดพลาดในการสร้างเทอมปีการศึกษา" }); }
};

export const updateTerm = async (req, res) => {
  try { return res.status(200).json(await termService.updateTerm(req.body)); }
  catch (error) { return res.status(error.statusCode || 500).json({ message: error.message || "Error: เกิดข้อผิดพลาดในการแก้ไขเทอมปีการศึกษา" }); }
};

export const deleteTerm = async (req, res) => {
  if (req.params.termId) {
    try { res.status(200).json(await termService.deleteTerm(req.params.termId)); }
    catch (error) { console.error(error); res.status(500).json({ message: "ไม่สามารถลบปีการศึกษาเทอมได้" }); }
  }
};

export const getTermByStudent = async (req, res) => {
  try { res.status(200).json(await termService.getTermByStudent(req.user.id)); }
  catch (error) { res.status(error.statusCode || 500).json({ message: error.message || "something happen!" }); }
};
