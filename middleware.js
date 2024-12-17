import db from '../prisma/client.js';
function isAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }
    try{
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    }catch(err){
        console.error(err);
    }
}