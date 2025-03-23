import { comparePassword, hashPassword } from "../helper/bcrypt.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import db from '../prisma/client.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../libs/resend.js';

export async function login(req, res) {
    const { email, password } = req.body;
  
    try{
        const user = await db.teacher.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = generateToken({ id: user.tchId, email: user.email }, '1h');
        const refreshToken = generateToken({ id: user.tchId, email: user.email }, '7d');
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'None',
        //     domain: '.art-ohm.space',
        //     maxAge: 3600 * 1000 // 1 hour, or whatever expiration time you need
        // });
        return res.json({ token, refreshToken, user });
    }catch(err){
        console.error(err);
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
        const user = await db.teacher.findUnique({
            where: {
                email: decoded.email
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = generateToken({ id: user.tchId, email: user.email }, '1h');
        // res.cookie('token', token, {
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
        const user = await db.teacher.findUnique({
            where: {
                email: decoded.email
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

export const newLogin = async (req, res) => {
    const {email} = req.body;
    try {
        const teacher = await db.teacher.findFirst({
            where: {
                email: email
            }
        });
        if(!teacher.password){
            const token = jwt.sign({id: teacher.tchId}, process.env.JWT_SECRET, {expiresIn: '1h'});
            await sendEmail(email, '[ระบบบันทึกและติดตามการเข้าเรียนและกิจกรรมของนักเรียน] สร้างรหัสผ่านครั้งแรก', `สำหรับตั้งรหัสผ่านครั้งแรก กรุณาคลิกที่ลิงก์นี้ <a href="${process.env.TEACHER_WEB_CLIENT}/new-password/?tk=${token}">เพื่อตั้งรหัสผ่านครั้งแรก</a>`);
            res.json({
                massage: 'ระบบได้ส่งอีเมลสำหรับสร้างรหัสผ่านครั้งแรกแล้ว กรุณาตรวจสอบอีเมลของคุณ สามารถใช้งานได้เฉพาะ 1 ชั่วโมง',
            });
        }else if (teacher.password){
            res.status(401).json({
                message: 'บัญชีนี้ถูกตั้งรหัสผ่านแล้ว'
            });
        } else {
            res.status(404).json({
                message: 'ไม่พบบัญชีนี้ในระบบ'
            });
        }
}
    catch(err){
        console.error(err);
        return res.status(500).json({message: "ไม่พบบัญชีนี้ในระบบ"});
    }
}

export const newPassword = async (req, res) => {
    const {token, password} = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await hashPassword(password);
        const teacher = await db.teacher.update({
            where: {
                tchId: decoded.id
            },
            data: {
                password: hashedPassword
            }
        });
        res.json({
            message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        });
    } catch(err){
        console.error(err);
        return res.status(500).json({message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"});
    }
}