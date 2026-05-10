import * as repo from "../repositories/adminRepository.js";

export const getAllAdmins = async () => repo.findAll();
export const getAdmin = async (adminId) => repo.findById(adminId);

export const featchDataForSeachbar = async () => {
  const student = await repo.findAllStudents();
  const newStudent = student.map((s) => ({
    id: `${s.stdId}`,
    name: `${s.fName} ${s.lName}`,
    role: "Student",
  }));

  const teacher = await repo.findAllTeachers();
  const newTeacher = teacher.map((t) => ({
    id: `${t.tchId}`,
    name: `${t.fName} ${t.lName}`,
    role: "Teacher",
  }));

  const leader = await repo.findAllLeaders();
  const newLeader = leader.map((l) => ({
    id: `${l.ldrId}`,
    name: `${l.fName} ${l.lName}`,
    role: "Leader",
  }));

  return [...newStudent, ...newTeacher, ...newLeader];
};
