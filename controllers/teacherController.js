import * as teacherService from "../services/teacherService.js";

export const createTeacher = async (req, res) => {
  try {
    const teacher = await teacherService.createTeacher(req.body);
    res.json(teacher);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรายชื่อครู" });
  }
};

export const getAllTeacher = async (req, res) => {
  try {
    const teacherLists = await teacherService.getAllTeacher();
    res.json(teacherLists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลครู" });
  }
};

export const updateTeacher = async (req, res) => {
  const { uuid } = req.params;
  if (req.body) {
    try {
      const teacher = await teacherService.updateTeacher(uuid, req.body);
      res.json(teacher);
    } catch (err) {
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลครู" });
    }
  }
};

export const getTeacher = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const teacher = await teacherService.getTeacher(uuid);
      res.json(teacher);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ message: "ไม่พบข้อมูลครู" });
    }
  }
};

export const deleteTeacher = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const result = await teacherService.deleteTeacher(uuid);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลครู" });
    }
  }
};

export const getStudentAllAttendenceExcelOneSubject = async (req, res) => {
  try {
    const filePath = await teacherService.getStudentAllAttendenceExcelOneSubject(
      req.body.subjectId,
      req.body.classId
    );
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างไฟล์" });
  }
};

export const getAllDepartment = async (req, res) => {
  try {
    const department = await teacherService.getAllDepartment();
    res.json(department);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก" });
  }
};

export const getDepartment = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const department = await teacherService.getDepartment(uuid);
      res.json(department);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ message: "ไม่พบข้อมูลแผนก" });
    }
  }
};

export const createDepartment = async (req, res) => {
  if (req.body) {
    try {
      const department = await teacherService.createDepartment(req.body);
      res.json(department);
    } catch (err) {
      console.error(err);
    }
  }
};

export const updateDepartment = async (req, res) => {
  const { uuid } = req.params;
  if (req.body) {
    try {
      const department = await teacherService.updateDepartment(uuid, req.body);
      res.json(department);
    } catch (err) {
      console.error(err);
    }
  }
};

export const deleteDepartment = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const result = await teacherService.deleteDepartment(uuid);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแผนก" });
    }
  }
};

export async function getTeacherInfo(req, res) {
  try {
    const teacher = await teacherService.getTeacherInfo(req.user.id);
    return res.json(teacher);
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
}

export const restoreTeacher = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const result = await teacherService.restoreTeacher(uuid);
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการคืนค่าข้อมูลครู" });
    }
  }
};

export const getSoftDeletedTeachers = async (req, res) => {
  try {
    const deletedTeachers = await teacherService.getSoftDeletedTeachers();
    res.json(deletedTeachers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลครูที่ถูกลบ" });
  }
};
