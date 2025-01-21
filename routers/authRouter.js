import { Router } from "express";

import { login, checkAuth, getTokenformRefreshToken } from "../controllers/adminAuthController.js";

const router = Router();

// Admin Authentication
router.post('/a/login', login);
router.get('/a/check', checkAuth);
router.post('/a/refresh', getTokenformRefreshToken);

export default router;