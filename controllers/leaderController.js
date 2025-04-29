import db from '../prisma/client.js';
import { DateTime } from 'luxon';

export function getAllLeaders(req, res) {
    try {
        db.leader.findMany(
            {
                 include: {
                    classroom: true,
                 }
            }
        ).then((result) => {
            res.json(result);
        });
    } catch (error) {
        console.error(error);
    }
}

export async function getClassroomBystdId(req, res) {
    const stdId = req.user.id;
    try {
        const leader = await db.leader.findFirst({
            where: {
                stdId: stdId
            },
            include: {
                classroom: {
                    include : {
                        classroomType: true,
                        term: true,
                        classroomMembers: true,
                        teacher: true
                    }
                }
            }
        });
        if (!leader) {
            return res.status(404).json({ message: 'Leader not found' });
        }
        return res.json(leader.classroom);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getClassroomMembersByClassroomId(req, res) {
    const { classId} = req.params;
    try {
        const classroomMembers = await db.classroomMember.findMany({
            where: {
                classId: classId
            },
            include: {
                student: true,
                classroom: {
                    include: {
                        teacher: true,
                        term: true,
                        classroomType: true,
                    }
                }
            }
        });
        if (!classroomMembers) {
            return res.status(404).json({ message: 'Classroom members not found' });
        }
        return res.json(classroomMembers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}