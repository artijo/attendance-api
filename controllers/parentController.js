import db from '../prisma/client.js';

export async function createParent(req, res) {
    const { userId, displayName } = req.body;
    console.log(userId);
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
                student: true,
            },
        });

        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

