import { DateTime } from "luxon";
import { AppError } from "../utils/AppError.js";
import * as classroomRepository from "../repositories/classroomRepository.js";

async function resolveLeaderId(leaderId) {
  if (!leaderId) return undefined;
  let leader = await classroomRepository.findLeader(leaderId);
  if (leader) return leader.ldrId;
  leader = await classroomRepository.createLeader({ student: { connect: { stdId: leaderId } } });
  return leader.ldrId;
}

export const createClassroom = async (body) => {
  const leaderId = await resolveLeaderId(body.leaderId);
  const classroom = await classroomRepository.create({
    classLevel: parseInt(body.classLevel),
    classRoom: parseInt(body.classRoom),
    term: { connect: { termId: body.termId } },
    leader: leaderId ? { connect: { ldrId: leaderId } } : undefined,
    classroomType: { connect: { classTypeId: body.classTypeId } },
  });
  if (body.teacherIds) {
    for (const teacherId of body.teacherIds) {
      await classroomRepository.createClassroomTeacher({
        teacher: { connect: { tchId: teacherId } },
        classroom: { connect: { classId: classroom.classId } },
      });
    }
  }
  return { message: "Create Classroom Success" };
};

export const updateClassroom = async (body) => {
  const leaderId = await resolveLeaderId(body.leaderId);
  await classroomRepository.update(body.classId, {
    classLevel: parseInt(body.classLevel),
    classRoom: parseInt(body.classRoom),
    term: { connect: { termId: body.termId } },
    classroomType: { connect: { classTypeId: body.classTypeId } },
    leader: leaderId ? { connect: { ldrId: leaderId } } : undefined,
  });
  await classroomRepository.deleteClassroomTeachers(body.classId);
  if (body.teacherIds && body.teacherIds.length > 0) {
    await Promise.all(
      body.teacherIds.map((teacherId) =>
        classroomRepository.createClassroomTeacher({
          teacher: { connect: { tchId: teacherId } },
          classroom: { connect: { classId: body.classId } },
        })
      )
    );
  }
  return { message: "Update Classroom Success" };
};

export const getAllClassroom = async (noMembers) => {
  if (noMembers) {
    return classroomRepository.findMany({ deletedAt: null });
  }
  return classroomRepository.findMany(
    { deletedAt: null },
    {
      classroomType: true, term: true,
      classroomMembers: { where: { deletedAt: null }, include: { student: true } },
      leader: { include: { student: true } },
      classTeacher: { where: { deletedAt: null }, include: { teacher: true } },
    },
    [{ classLevel: "asc" }, { classRoom: "asc" }]
  );
};

export const getClassroom = async (uuid) => {
  const classroom = await classroomRepository.findUnique(uuid, {
    classroomType: true,
    term: { include: { holiday: true } },
    classroomMembers: { where: { deletedAt: null }, include: { student: true } },
    classTeacher: { where: { deletedAt: null }, include: { teacher: true } },
    leader: { include: { student: true } },
    timetable: { where: { deletedAt: null }, include: { subject: true } },
  });
  if (classroom && classroom.deletedAt) throw new AppError(404, "Classroom not found");
  return classroom;
};

export const getAllClassroomType = async () => classroomRepository.findAllTypes({ deletedAt: null });

export const createClassroomType = async (body) => {
  await classroomRepository.createType({
    classTypeNameThai: body.classTypeNameThai,
    classTypeNameEng: body.classTypeNameEng,
  });
  return { message: "Create Classroom Type Success" };
};

export const updateClassroomType = async (uuid, body) => {
  await classroomRepository.updateType(uuid, {
    classTypeNameThai: body.classTypeNameThai,
    classTypeNameEng: body.classTypeNameEng,
  });
  return { message: "Update Classroom Type Success" };
};

export const deleteClassroomType = async (uuid) => {
  await classroomRepository.updateType(uuid, { deletedAt: new Date() });
  return { message: "Delete Classroom Type Success" };
};

export const createClassroomMember = async (body) => {
  const studentinclass = await classroomRepository.findMembers({ stdId: body.studentId, deletedAt: null });
  if (studentinclass.length > 0) {
    const getclassterm = await classroomRepository.findMemberClassroom(body.classId);
    for (const student of studentinclass) {
      let term = await classroomRepository.findMemberClassroom(student.classId);
      if (term.term.termId === getclassterm.term.termId) {
        throw new AppError(400, "นักเรียนนี้มีอยู่ในห้องเรียนแล้ว");
      }
    }
  }
  await classroomRepository.createMember({ stdId: body.studentId, classId: body.classId, stdNo: body.stdNo });
  return { message: "Create Classroom Member Success" };
};

export const updateClassroomMember = async (uuid, body) => {
  await classroomRepository.updateMember(uuid, {
    stdNo: body.stdNo,
    behaviourScore: parseInt(body.behaviourScore),
  });
  return { message: "Update Classroom Member Success" };
};

export const deleteClassroomMember = async (uuid) => {
  await classroomRepository.updateMember(uuid, { deletedAt: new Date() });
  return { message: "Delete Classroom Member Success" };
};

export const getClassroomByAcademicYearTerm = async (termId) => {
  return classroomRepository.findMany(
    { termId, deletedAt: null },
    {
      classroomType: true, term: true,
      classroomMembers: { where: { deletedAt: null }, include: { student: true } },
      classTeacher: { where: { deletedAt: null }, include: { teacher: true } },
      leader: { include: { student: true } },
      timetable: { where: { deletedAt: null }, include: { subject: true } },
    },
    [{ classLevel: "asc" }, { classRoom: "asc" }]
  );
};

export const getAcademicYearClassroom = async () => {
  const classrooms = await classroomRepository.findMany({ deletedAt: null }, {}, [{ academicYear: "asc" }]);
  const uniqueData = [];
  if (classrooms) {
    const semesterMap = classrooms.map((items) => ({
      semester: items.semester,
      academicYear: items.academicYear,
    }));
    for (const item of semesterMap) {
      let found = uniqueData.some((ud) => ud.semester === item.semester && ud.academicYear === item.academicYear);
      if (!found) uniqueData.push(item);
    }
  }
  return uniqueData;
};

export const getClassroomFilterByAcademicYearAndLevel = async (academicYear, classroomLevel) => {
  return classroomRepository.findMany(
    { AND: { termId: academicYear, classLevel: parseInt(classroomLevel), deletedAt: null } },
    {},
    [{ classLevel: "asc" }, { classRoom: "asc" }]
  );
};

export const getTeacherAdvisorClassroom = async (userId) => {
  const advisorList = await classroomRepository.findTeachers(
    { tchId: userId, deletedAt: null },
    { classTeacher: { where: { deletedAt: null } } }
  );
  if (advisorList.length === 0) return { not_found: "ไม่มีห้องที่เป็นที่ปรึกษา" };
  const classroomsIds = advisorList.map((a) => a.classTeacher.map((c) => c.classId)).flat(1);
  if (classroomsIds.some((v) => v === null)) return { not_found: "ไม่มีห้องที่เป็นที่ปรึกษา" };
  return classroomRepository.findMany(
    { classId: { in: classroomsIds }, deletedAt: null },
    {
      classroomMembers: { where: { deletedAt: null }, include: { student: true } },
      term: { include: { holiday: true } },
      classroomType: true,
      leader: { include: { student: true } },
    },
    [{ term: { termStart: "desc" } }]
  );
};

export const getClassroomByClassAndSubject = async (subjectId, termId) => {
  return classroomRepository.findMany(
    {
      timetable: { some: { subId: subjectId, deletedAt: null } },
      termId, deletedAt: null,
    },
    {
      classroomType: true, term: true,
      classTeacher: { where: { deletedAt: null }, include: { teacher: true } },
    },
    [{ classLevel: "asc" }, { classRoom: "asc" }]
  );
};

export const softDeleteClassroom = async (uuid) => {
  await classroomRepository.update(uuid, { deletedAt: DateTime.now().toJSDate() });
  return { message: "Soft Delete Classroom Success" };
};

export const restoreClassroom = async (uuid) => {
  await classroomRepository.update(uuid, { deletedAt: null });
  return { message: "Restore Classroom Success" };
};

export const getDeletedClassrooms = async () => classroomRepository.findDeleted();
