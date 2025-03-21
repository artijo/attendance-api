import { comparePassword } from "../helper/bcrypt.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import db from '../prisma/client.js';

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