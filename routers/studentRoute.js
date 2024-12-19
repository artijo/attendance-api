import { Router } from "express";

const router = Router();

import {
    getStudentClassroomTerm,
    attendenceBySubjectAndStuId
} from "../controllers/attendenceController.js";

// router.get('/ping', (req, res) => {
//     res.json({ message: 'pong' });
// });

router.get('/studentTerm/:stdId', getStudentClassroomTerm)
router.get('/student/:classroomId/:studentId', attendenceBySubjectAndStuId)


export default router;