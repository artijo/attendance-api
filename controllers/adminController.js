import * as adminService from "../services/adminService.js";

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdmin = async (req, res) => {
  try {
    const admin = await adminService.getAdmin(req.params.adminId);
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const featchDataForSeachbar = async (req, res) => {
  try {
    const data = await adminService.featchDataForSeachbar();
    res.json(data);
  } catch (err) {
    console.error(err);
  }
};