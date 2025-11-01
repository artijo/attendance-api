import db from "../prisma/client.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { hashPassword, comparePassword } from "../helper/bcrypt.js";
import {
  inputTeacherForm,
  inputUpdateTeacherForm,
  handdleErrorDuplicateKeyTeacher,
} from "../validator.js";

import { createExcelSubjectAttendence } from "../helper/excel.js";

export const createTeacher = async (req, res) => {
  let body = req.body;
  try {
    if (body.password) {
      var password = await hashPassword(body.password); // รหัสผ่่านที่ผ่านการเข้ารหัสแล้วเรียบร้อยแล้ว
    }
    const teacher = await db.teacher.create({
      data: {
        fName: body.fName,
        lName: body.lName,
        password: body.password ? password : null,
        email: body.email == "" ? null : body.email,
        tel: body.tel == "" ? null : body.tel,
        department: {
          connect: {
            deptId: body.deptId,
          },
        },
      },
    });
    res.json(teacher);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการสร้างรายชื่อครู" });
  }
};

export const getAllTeacher = async (req, res) => {
  try {
    const teacherLists = await db.teacher.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [
        {
          fName: "asc",
        },
      ],
      include: {
        department: true,
        classTeacher: {
          where: {
            deletedAt: null,
          },
          include: {
            classroom: {
              include: {
                term: true,
              },
            },
          },
        },
      },
    });
    res.json(teacherLists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลครู" });
  }
};

export const updateTeacher = async (req, res) => {
  let body = req.body;
  const { uuid } = req.params;
  if (body) {
    try {
      let updateData = {
        fName: body.fName,
        lName: body.lName,
        email: body.email == "" ? null : body.email,
        tel: body.tel == "" ? null : body.tel,
        department: {
          connect: {
            deptId: body.deptId,
          },
        },
      };

      if (body.password || body.password === "") {
        const hashedPassword = await hashPassword(body.password);
        updateData.password = hashedPassword;
      }

      const teacher = await db.teacher.update({
        where: {
          tchId: uuid,
        },
        data: updateData,
      });
      res.json(teacher);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลครู" });
    }
  }
};

export const getTeacher = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const teacher = await db.teacher.findFirstOrThrow({
        where: {
          tchId: uuid,
          deletedAt: null,
        },
        include: {
          department: true,
          classTeacher: {
            where: {
              deletedAt: null,
            },
            include: {
              classroom: {
                include: {
                  term: true,
                },
              },
            },
          },
        },
      });
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
      await db.teacher.update({
        where: {
          tchId: uuid,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return res.json({ message: "ลบข้อมูลครูสำเร็จ" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลครู" });
    }
  }
};

export const getStudentAllAttendenceExcelOneSubject = async (req, res) => {
  // export สรุปการเข้าเรียนของนักเรียนทุกคนแต่วิชาเดียว
  const subjectId = req.body.subjectId; // uuid วิชา
  const classroomId = req.body.classId; // uuid ห้องเรียน

  try {
    const timetable = await db.timetable.findMany({
      where: {
        AND: {
          subId: subjectId,
          classId: classroomId,
          deletedAt: null,
        },
      },
      select: {
        timetableId: true,
      },
    });

    const timetableIds = timetable.map((item) => item.timetableId);

    const objectTimetableForSearch = {
      timetableId: {
        in: timetableIds,
      },
    };

    const studingTime = await db.studingTime.findMany({
      where: objectTimetableForSearch,
      select: {
        studyTimeId: true,
      },
      orderBy: {
        studingTimeDate: "asc",
      },
    });

    const studentInThisClassRoom = await db.classroomMember.findMany({
      where: {
        classId: classroomId,
      },
      select: {
        stdId: true,
      },
    });

    const stutingTimes = studingTime.map((item) => item.studyTimeId);

    const studentInClassroom = studentInThisClassRoom.map((item) => item.stdId);

    const student = await db.student.findMany({
      select: {
        fName: true,
        lName: true,
        attendance: {
          where: {
            AND: {
              stdId: {
                in: studentInClassroom,
              },
              studingTimeId: {
                in: stutingTimes,
              },
            },
          },
        },
      },
    });

    const subjectName = await db.subject.findFirst({
      select: {
        subNameEng: true,
      },
    });

    const fileName = await createExcelSubjectAttendence(
      student,
      subjectName.subNameEng
    );
    const file = path.join(__dirname, `../public/${fileName}`);
    res.sendFile(file);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างไฟล์" });
  }
};

export const getAllDepartment = async (req, res) => {
  try {
    const department = await db.department.findMany({
      where: {
        deletedAt: null,
      },
    });
    res.json(department);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก" });
  }
};

export const getDepartment = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      const department = await db.department.findFirstOrThrow({
        where: {
          deptId: uuid,
          deletedAt: null,
        },
      });
      res.json(department);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ message: "ไม่พบข้อมูลแผนก" });
    }
  }
};

export const createDepartment = async (req, res) => {
  const body = req.body;
  if (body) {
    try {
      const department = await db.department.create({
        data: {
          deptName: body.deptName,
        },
      });
      res.json(department);
    } catch (err) {
      console.error(err);
    }
  }
};

export const updateDepartment = async (req, res) => {
  const body = req.body;
  const { uuid } = req.params;
  if (body) {
    try {
      const department = await db.department.update({
        where: {
          deptId: uuid,
        },
        data: {
          deptName: body.deptName,
        },
      });
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
      await db.department.update({
        where: {
          deptId: uuid,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return res.json({
        message: "delete success",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแผนก" });
    }
  }
};

export async function getTeacherInfo(req, res) {
  const teacherId = req.user.id;
  try {
    const teacher = await db.teacher.findUnique({
      where: {
        tchId: teacherId,
      },
      include: {
        department: true,
        classTeacher: {
          where: {
            deletedAt: null,
          },
          include: {
            classroom: {
              include: {
                term: true,
              },
            },
          },
        },
        subject: {
          where: {
            deletedAt: null,
          },
        },
        activity: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if teacher is soft deleted
    if (teacher.deletedAt) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.json(teacher);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const restoreTeacher = async (req, res) => {
  const uuid = req.params.uuid;
  if (uuid) {
    try {
      await db.teacher.update({
        where: {
          tchId: uuid,
        },
        data: {
          deletedAt: null,
        },
      });
      return res.json({ message: "คืนค่าข้อมูลครูสำเร็จ" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการคืนค่าข้อมูลครู" });
    }
  }
};

export const getSoftDeletedTeachers = async (req, res) => {
  try {
    const deletedTeachers = await db.teacher.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });
    res.json(deletedTeachers);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลครูที่ถูกลบ" });
  }
};
