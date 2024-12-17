import { comparePassword } from "../helper/bcrypt.js";
import { generateToken, verifyToken } from "../helper/jwt.js";
import db from '../prisma/client.js';

export async function login(req, res) {
    const { username, password } = req.body;
  
    try{
        const user = await db.admin.findUnique({
            where: {
                username
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = generateToken({ id: user.id, username: user.username }, '1h');
        const refreshToken = generateToken({ id: user.adminId, username: user.username }, '7d');
        res.cookie('token', token, { httpOnly: true });
        return res.json({ token, refreshToken });
    }catch(err){
        console.error(err);
    }
}

export async function getTokenformRefreshToken(req, res) {
    let refreshToken  = req.headers['authorization'].split(' ')[1];

    try{
        const decoded = verifyToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await db.admin.findUnique({
            where: {
                username: decoded.username
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = generateToken({ id: user.id, username: user.username }, '1h');
        res.cookie('token', token, { httpOnly: true });
        return res.json({ token });
    }catch(err){
        console.error(err);
    }
}

export async function checkAuth(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }
    try{
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.log(decoded);
        const user = await db.admin.findUnique({
            where: {
                username: decoded.username
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({status: 'logged in'});
    }catch(err){
        console.error(err);
    }
}