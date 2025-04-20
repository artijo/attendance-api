import { Router } from "express";
import { createParent, getallStudentParent } from "../controllers/parentController.js";

const router = Router();

router.post('/create', createParent);
router.get('/students/:userId', getallStudentParent);

export default router;