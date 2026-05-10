import * as svc from "../services/holidayService.js";

export const fullCalendarHoliday = async (req, res) => {
  try { res.json(await svc.fullCalendarHoliday(req.params.classroomId)); } catch (e) { console.error(e); }
};
export const getHolidayList = async (req, res) => {
  if (req.params.termId) { try { res.status(200).json(await svc.getHolidayList(req.params.termId)); } catch (e) { console.error(e); res.status(500).json(e); } }
};
export const deleteHoliday = async (req, res) => {
  try { res.status(200).json(await svc.deleteHoliday(req.params.holidayId)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getOneHoliday = async (req, res) => {
  if (req.params.holidayId) { try { res.json(await svc.getOneHoliday(req.params.holidayId)); } catch (e) { console.error(e); res.json(e); } }
};
export const updateHoliday = async (req, res) => {
  try { res.status(200).json(await svc.updateHoliday(req.params.holidayId, req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getHolidayListAuto = async (req, res) => {
  try { res.json(await svc.getHolidayListAuto()); } catch (e) { console.error(e); res.json(e); }
};
export const createHoliday = async (req, res) => {
  try { res.status(200).json(await svc.createHoliday(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
