import db from "../prisma/client.js";

export const findAdminByUsername = (username) => {
  return db.admin.findUnique({
    where: { username },
  });
};

export const updateAdminPassword = (username, hashedPassword) => {
  return db.admin.update({
    where: { username },
    data: { password: hashedPassword },
  });
};
