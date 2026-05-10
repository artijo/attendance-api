import db from "../prisma/client.js";

export const findStudentById = (stdId) => {
  return db.student.findUnique({
    where: { stdId },
  });
};

export const updateStudentGoogleId = (stdId, googleId, email) => {
  return db.student.update({
    where: { stdId },
    data: { googleId, email },
  });
};

export const findLeaderByStdId = (stdId) => {
  return db.leader.findFirst({
    where: { stdId },
  });
};
