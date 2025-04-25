import db from '../prisma/client.js';

export async function createParent(req, res) {
    const { userId, displayName } = req.body;
    try {
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (parent) {
            return res.status(400).json({ message: 'Parent already exists' });
        } 
         const newParent = await db.parent.create({
                data: {
                 lineId: userId,
                 name: displayName,
                },
          });
        res.status(201).json(newParent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getallStudentParent(req, res) {
    const { userId } = req.params;
    try {
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const students = await db.studentParent.findMany({
            where: {
                prntId: parent.prntId
            },
            include: {
                student: {
                    include: {
                        classroomMembers: {
                            include: {
                                classroom: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function studentLookup(req, res) {
    const { studentId } = req.params;
    try {
        const student = await db.student.findUnique({
            where: {
                stdId: studentId,
            },
            include: {
                classroomMembers: {
                    include: {
                        classroom: true,
                    },
                },
            }
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function addStudentParent(req, res) {
    const { studentId, userId } = req.body;
    try {
        const student = await db.student.findUnique({
            where: {
                stdId: studentId,
            },
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        // check if the student is already linked to the parent
        const isAlreadyLinked = await db.studentParent.findFirst({
            where: {
                stdId: student.stdId,
                prntId: parent.prntId,
            }
        })
        if (isAlreadyLinked) {
            return res.status(400).json({ message: 'Student is already linked to this parent' });
        }

        const studentParent = await db.studentParent.create({
            data: {
                stdId: student.stdId,
                prntId: parent.prntId,
            },
        });
        res.status(201).json(studentParent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deleteStudentParent(req, res) {
    const { studentId, userId } = req.body;
    try {
        const student = await db.student.findUnique({
            where: {
                stdId: studentId,
            },
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const studentParent = await db.studentParent.deleteMany({
            where: {
                stdId: student.stdId,
                prntId: parent.prntId,
            },
        });
        res.status(200).json(studentParent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getParentByLineId(req, res) {
    const { userId } = req.params;
    try {
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json(parent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateParent(req, res) {
    const { userId, name, email, tel }  = req.body;
    try {
        const parent = await db.parent.findUnique({
            where: {
                lineId: userId,
            },
        });
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const updatedParent = await db.parent.update({
            where: {
                lineId: userId,
            },
            data: {
                name: name,
                email: email,
                tel: tel,
            },
        });
        res.status(200).json(updatedParent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}