import { comparePassword } from "../helper/bcrypt.js";
import { generateToken } from "../helper/jwt.js";
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
        const refreshToken = generateToken({ id: user.id, username: user.username }, '7d');
        res.cookie('token', token, { httpOnly: true });
        return res.json({ token, refreshToken });
    }catch(err){
        console.error(err);
    }
}

export async function getTokenformRefreshToken(req, res) {
    const refreshToken  = req.headers['Authorization'].split(' ')[1];
    try{
        const decoded = verifyToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await db.admin.findUnique({
            where: {
                id: decoded.id
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