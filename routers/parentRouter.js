import { Router } from "express";
import { createParent, getallStudentParent, studentLookup, addStudentParent, deleteStudentParent } from "../controllers/parentController.js";

const router = Router();

router.post('/create', createParent);
router.get('/students/:userId', getallStudentParent);
router.get('/student/:studentId', studentLookup);
router.post('/addStudent', addStudentParent);
router.post('/unsubscribe', deleteStudentParent);

export default router;