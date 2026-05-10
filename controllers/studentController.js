import * as studentService from "../services/studentService.js";
import { handdleErrorDuplicateKeyStudent } from "../validator.js";

export const createStudent = async (req, res) => {
  let body = req.body;
  if (body) {
    try {
      const result = await studentService.createStudent(body);
      res.json(result);
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        message: err.message || "เกิดข้อผิดพลาดในการสร้างรายชื่อนักเรียน",
        error: err.message,
      });
    }
  }
};

export const createStudentWithFile = async (req, res) => {
  let body = req.body;
  console.log(body.sheets);
  try {
    const result = await studentService.createStudentWithFile(body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "เกิดข้อผิดพลาดในการสร้างรายชื่อนักเรียน",
      error: err.message,
    });
  }
};

export const getAllStudent = async (req, res) => {
  try {
    const result = await studentService.getAllStudent(req.query.class);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getStudent = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const student = await studentService.getStudent(uuid);
      res.json(student);
    } catch (err) {
      console.error(err);
      res.status(404).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }
  }
};

export const deleteStudent = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      await studentService.deleteStudent(uuid);
    } catch (err) {
      console.error(err);
    }
  }
};

export const updateStudent = async (req, res) => {
  let body = req.body;
  if (body) {
    try {
      const student = await studentService.updateStudent(body);
      res.json(student);
    } catch (error) {
      console.error(error);
      handdleErrorDuplicateKeyStudent(req, res, error);
    }
  }
};

export const getStudentwithoutClassroom = async (req, res) => {
  try {
    const students = await studentService.getStudentWithoutClassroom();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน",
      error: error.message,
    });
  }
};

export const getStudentforaddmemberinclassroom = async (req, res) => {
  try {
    const students = await studentService.getStudentForAddMember();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน",
      error: error.message,
    });
  }
};

export const getBehaviorScoreTransaction = async (req, res) => {
  try {
    const transactions = await studentService.getBehaviorScoreTransaction(req.user?.id);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรมคะแนนพฤติกรรม",
      error: error.message,
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const data = await studentService.getDashboardData(req.user?.id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน",
      error: error.message,
    });
  }
};

export const softDeleteStudent = async (req, res) => {
  const uuid = req.params.stdId;
  if (uuid) {
    try {
      const result = await studentService.softDeleteStudent(uuid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดในการลบนักเรียน",
        error: err.message,
      });
    }
  }
};

export const restoreSoftDeletedStudent = async (req, res) => {
  const uuid = req.params.stdId;
  if (uuid) {
    try {
      const result = await studentService.restoreSoftDeletedStudent(uuid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดในการกู้คืนข้อมูลนักเรียน",
        error: err.message,
      });
    }
  }
};

export const getSoftDeletedStudents = async (req, res) => {
  try {
    const students = await studentService.getSoftDeletedStudents();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียนที่ถูกลบ",
      error: err.message,
    });
  }
};
