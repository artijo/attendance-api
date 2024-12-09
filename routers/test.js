import { Router } from "express";
import { test } from "../controllers/studentController.js";
import {getStudentAllAttendenceExcelOneSubject} from "../controllers/teacherController.js";

const router = Router();

router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

router.post('/eiei', getStudentAllAttendenceExcelOneSubject);

export default router;