import db from "../prisma/client.js";

export const findTeacherByEmail = (email) => {
  return db.teacher.findUnique({
    where: { email },
  });
};

export const findTeacherByFirst = (email) => {
  return db.teacher.findFirst({
    where: { email },
  });
};

export const updateTeacherById = (tchId, data) => {
  return db.teacher.update({
    where: { tchId },
    data,
  });
};
