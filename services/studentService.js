import { AppError } from "../utils/AppError.js";
import { getLastestTerm } from "../helper/helper.js";
import { inputStudentForm, handdleErrorDuplicateKeyStudent } from "../validator.js";
import { DateTime } from "luxon";
import * as studentRepository from "../repositories/studentRepository.js";

export const createStudent = async (body) => {
  const student = await studentRepository.createOne({
    stdId: body.stdId,
    title: body.title,
    fName: body.fName,
    lName: body.lName,
    email: body.email ? body.email : null,
    tel: body.tel ? body.tel : null,
  });
  return { message: `สร้าง ${student.fName} ${student.lName} แล้ว` };
};

export const createStudentWithFile = async (body) => {
  if (!body?.sheets) {
    throw new AppError(400, "ไม่พบข้อมูลนักเรียน");
  }

  const checkempty = Object.values(body.sheets)
    .flat()
    .filter(
      (item) =>
        !item.studentId ||
        !item.class ||
        !item.room ||
        !item.no ||
        !item.title ||
        !item.firstName ||
        !item.lastName
    );

  if (checkempty.length > 0) {
    throw new AppError(400, "ข้อมูลนักเรียนไม่ครบถ้วน");
  }

  const allStudents = Object.values(body.sheets).flat();

  await studentRepository.createMany(
    allStudents
      .filter((item) => item.studentId && item.studentId.toString().trim() !== "")
      .map((item) => ({
        stdId: item.studentId.toString(),
        title:
          item.title === "เด็กชาย"
            ? "BOY"
            : item.title === "เด็กหญิง"
              ? "GIRL"
              : item.title === "นาย"
                ? "MR"
                : "MS",
        fName: item.firstName,
        lName: item.lastName,
        email: item.email || null,
        tel: item.tel || null,
      }))
  );

  const currentYear = new Date().getFullYear();

  const classrooms = await studentRepository.findAllClassrooms();
  const classroomMap = new Map();
  classrooms.forEach((classroom) => {
    const key = `${classroom.classLevel}-${classroom.classRoom}`;
    classroomMap.set(key, classroom.classId);
  });

  // Create missing classrooms
  for (const student of allStudents) {
    if (!student.class || !student.room) continue;
    const key = `${parseInt(student.class)}-${parseInt(student.room)}`;
    if (!classroomMap.has(key)) {
      const defaultClassType = await studentRepository.findClassroomTypeDefault();
      let term = await studentRepository.findAcademicTermByYearSemester(currentYear, 1);
      if (!term) {
        term = await studentRepository.createAcademicTerm({
          academicYear: currentYear,
          semester: 1,
          termStart: new Date(currentYear, 5, 16),
          termEnd: new Date(currentYear, 9, 30),
        });
      }
      const newClassroom = await studentRepository.createClassroom({
        classLevel: parseInt(student.class),
        classRoom: parseInt(student.room),
        term: { connect: { termId: term.termId } },
        classroomType: { connect: { classTypeId: defaultClassType.classTypeId } },
      });
      classroomMap.set(key, newClassroom.classId);
    }
  }

  const classroomMembers = allStudents
    .filter((item) => item.studentId && item.studentId.toString().trim() !== "")
    .map((item) => {
      const key = `${parseInt(item.class)}-${parseInt(item.room)}`;
      const classId = classroomMap.get(key);
      if (!classId) return null;
      return {
        stdId: item.studentId.toString(),
        classId: classId,
        stdNo: item.no.toString(),
      };
    })
    .filter((item) => item !== null);

  await studentRepository.createClassroomMembers(classroomMembers);

  return { message: `สร้าง ${allStudents.length} รายชื่อนักเรียนแล้ว` };
};

export const getAllStudent = async (classQuery) => {
  if (classQuery && classQuery !== "all") {
    const classr = classQuery.split("-");
    const classroom = await studentRepository.findClassroomByLevel(classr[0], classr[1]);
    const students = await studentRepository.findClassroomMembers(classroom.classId);
    return students.map((item) => item.student);
  }
  return studentRepository.findAll(
    { deletedAt: null },
    {
      classroomMembers: {
        where: { deletedAt: null },
        include: { classroom: true },
      },
    }
  );
};

export const getStudent = async (uuid) => {
  return studentRepository.findById(uuid, {
    classroomMembers: {
      where: { deletedAt: null },
      include: { classroom: true },
    },
    parent: {
      where: { deletedAt: null },
      include: { parent: true },
    },
  });
};

export const deleteStudent = async (uuid) => {
  return studentRepository.updateById(uuid, { deletedAt: new Date() });
};

export const updateStudent = async (body) => {
  const validated = await inputStudentForm(body);
  return studentRepository.updateById(validated.stdId, {
    title: validated.title,
    fName: validated.fName,
    lName: validated.lName,
    email: validated.email == "" ? null : validated.email,
    tel: validated.tel == "" ? null : validated.tel,
  });
};

export const getStudentWithoutClassroom = async () => {
  return studentRepository.findStudentsWithoutClassroom();
};

export const getStudentForAddMember = async () => {
  return studentRepository.findStudentsForAddMember();
};

export const getBehaviorScoreTransaction = async (stdId) => {
  if (!stdId) throw new AppError(400, "ไม่พบรหัสนักเรียน");
  return studentRepository.findBehaviourScoreTransactions(stdId);
};

export const getDashboardData = async (stdId) => {
  if (!stdId) throw new AppError(400, "ไม่พบรหัสนักเรียน");

  let term = await studentRepository.findAcademicTerms();
  term = getLastestTerm(term);

  const student = await studentRepository.findStudentDashboard(stdId, term.termId);
  if (!student) throw new AppError(404, "ไม่พบข้อมูลนักเรียน");

  const pendingLeaves = await studentRepository.countPendingLeaves(stdId);

  return {
    stdId: student.stdId,
    title: student.title,
    fName: student.fName,
    lName: student.lName,
    email: student.email,
    tel: student.tel,
    classroomMembers: student.classroomMembers.map((member) => ({
      classId: member.classroom.classId,
      classLevel: member.classroom.classLevel,
      classRoom: member.classroom.classRoom,
      stdNo: member.stdNo,
      term: member.classroom.term,
      classroomType: member.classroom.classroomType,
      classTeacher: member.classroom.classTeacher
        ? member.classroom.classTeacher.map((ct) => ({
            teacherId: ct.teacher.teacherId,
            teacherName: `${ct.teacher.fName} ${ct.teacher.lName}`,
          }))
        : null,
      behaviourScore: member.behaviourScore,
      pendingLeaves: pendingLeaves,
    })),
  };
};

export const softDeleteStudent = async (stdId) => {
  const student = await studentRepository.updateById(stdId, {
    deletedAt: DateTime.now().toJSDate(),
  });
  return { message: `ลบนักเรียน ${student.fName} ${student.lName} แล้ว` };
};

export const restoreSoftDeletedStudent = async (stdId) => {
  const student = await studentRepository.updateById(stdId, { deletedAt: null });
  return { message: `กู้คืนข้อมูลนักเรียน ${student.fName} ${student.lName} แล้ว` };
};

export const getSoftDeletedStudents = async () => {
  return studentRepository.findSoftDeleted();
};
