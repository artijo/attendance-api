// สำหรับ Hash รหัสผ่าน
// const bcrypt = require('bcrypt');
import bcrypt, { hash } from "bcryptjs";
const saltRounds = 10;
const myPlaintextPassword = "s0/\/\P4$$w0rD"; // for test
const someOtherPlaintextPassword = "not_bacon"; // for test

export const hashPassword = async (password) => {
  // hash Password
  try {
    const passwordGotHash = await bcrypt.hash(password, saltRounds);
    return passwordGotHash;
  } catch (err) {
    console.error(err);
  }
};

export const comparePassword = async (
  inputPassword,
  hashPasswordFromDatabase,
) => {
  // เอาไว้เปรียบเทียบรหัสผ่าน
  try {
    if (!inputPassword && !hashPasswordFromDatabase) {
      console.log("pls input parameter!!");
      return;
    }
    // const hash = await hashPasswordFromDatabase
    // console.log(hash)
    const compareResult = await bcrypt.compare(
      inputPassword,
      hashPasswordFromDatabase,
    );
    if (compareResult == true) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
  }
};
// hashPassword();
// comparePassword();
