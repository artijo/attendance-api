import { Router } from "express";
import { createParent, getallStudentParent, studentLookup, addStudentParent } from "../controllers/parentController.js";

const router = Router();

router.post('/create', createParent);
router.get('/students/:userId', getallStudentParent);
router.get('/student/:studentId', studentLookup);
router.post('/addStudent', addStudentParent);

export default router;