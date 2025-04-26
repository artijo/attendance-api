import { generateToken, verifyToken } from "../helper/jwt.js";
import db from '../prisma/client.js';
import axios from 'axios';
import { sensorName } from "../helper/helper.js";

export async function checkStudent(req, res) {
    const { studentId } = req.params;
    try {
        const student = await db.student.findUnique({
            where: {
                stdId: studentId
            }
        });

        const studentName = student.fName + " " + sensorName(student.lName);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.json({ googleId: student.googleId, studentId: student.stdId, studentName });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function LoginWithGoogle(req, res) {
    const { token, studentId } = req.body;
  try {
    // ตรวจสอบ id_token กับ Google
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const { sub: google_id, name, email } = response.data;

    // เช็คว่าผู้ใช้มีในระบบหรือยัง
    let student = await db.student.findUnique({
      where: {
        stdId: studentId
      },
    });
    if (!student.googleId) {
      // ถ้ายังไม่มี ให้สร้างผู้ใช้ใหม่
      student = await db.student.update({
        where: {
          stdId: studentId
        },
        data: {
          googleId: google_id,
          email,
        },
      });
    }
    if (student.googleId !== google_id) {
        console.log(student.googleId, google_id);
        return res.status(401).json({ message: 'Google ID mismatch' });
    }


    // สร้าง JWT
    const jwtToken = generateToken({ id: student.stdId, google_id }, '1h');
    const refreshToken = generateToken({ id: student.stdId, google_id }, '7d');
    // ส่ง JWT กลับไปที่ client
    return res.json({ jwtToken, studentId: student.stdId, refreshToken, fName:student.fName, lName:student.lName, email:student.email, tel:student.tel });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}

export async function getTokenformRefreshToken(req, res) {
    let refreshToken  = req.headers['authorization'].split(' ')[1];
    // console.log(refreshToken);

    try{
        const decoded = verifyToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await db.student.findUnique({
            where: {
                stdId: decoded.id

            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = generateToken({ id: user.stdId, google_id: user.googleId }, '1h');
        // res.cookie('token', token,{
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'None',
        //     domain: '.art-ohm.space',
        //     maxAge: 3600 * 1000 // 1 hour, or whatever expiration time you need
        // });
        return res.json({ token });
    }catch(err){
        console.error(err);
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
}

export async function checkAuth(req, res) {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }
    try{
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await db.student.findUnique({
            where: {
                stdId: decoded.id
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({status: 'logged in'});
    }catch(err){
        res.status(401).json({ err });
        console.error(err);
    }
}