import { Router } from "express";
import { createParent, getallStudentParent, studentLookup, addStudentParent, deleteStudentParent, getParentByLineId, updateParent } from "../controllers/parentController.js";

const router = Router();

router.post('/create', createParent);
router.get('/students/:userId', getallStudentParent);
router.get('/student/:studentId', studentLookup);
router.post('/addStudent', addStudentParent);
router.post('/unsubscribe', deleteStudentParent);
router.get('/profile/:userId', getParentByLineId);
router.put('/update-profile', updateParent);

export default router;