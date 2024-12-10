import jwt from 'jsonwebtoken';

export const generateToken = (data, expires) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: expires });
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export const decodeToken = (token) => {
    return jwt.decode(token);
}