import { Router } from "express";
import { test } from "../controllers/studentController.js";

const router = Router();

router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

router.get('/eiei', test);

export default router;