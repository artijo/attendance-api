import db from '../prisma/client.js';
import { DateTime } from 'luxon';
import { pushMessageToLine } from '../helper/line.js';
import { formatTitle } from '../helper/helper.js';

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

export async function getTimeTableandStudytimeByClassId(req, res) {
    const { classId } = req.params;
    const zone = 'Asia/Bangkok'; // กำหนด timezone ของประเทศไทย
    
    // ใช้ timezone ของไทยในการกำหนดวันของสัปดาห์
    const todaydayofweek = DateTime.now().setZone(zone).weekday;
    
    // สร้างช่วงเวลาของวันนี้โดยระบุ timezone ให้ชัดเจน
    const todayStart = DateTime.now().setZone(zone).startOf('day').toUTC().toJSDate();
    const todayEnd = DateTime.now().setZone(zone).endOf('day').toUTC().toJSDate();
    
    try {
        const timetable = await db.timetable.findMany({
            where: {
                classId: classId,
                dayOfWeek: todaydayofweek,
                studyTime: {
                    some: {
                        studingTimeDate: {
                            gte: todayStart,
                            lte: todayEnd
                        }
                    }
                }
            },
            include: {
                classroom: true,
                subject: {
                    include: {
                        teacher: true,
                    }
                },
                studyTime: {
                    where: {
                        studingTimeDate: {
                            gte: todayStart,
                            lte: todayEnd
                        }
                    }
                }
            }
        });
        
        if (!timetable || timetable.length === 0) {
            return res.status(404).json({ message: 'Timetable not found' });
        }
        return res.json(timetable);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getStuydingTimeById = async (req, res) => {
    const studingTimeId = req.params.studingTimeId;
    try{
        const studingTime = await db.studingTime.findUnique({
            where: {
                studyTimeId: studingTimeId
            },
            include: {
                timetable: {
                    include: {
                        classroom: {
                            include: {
                                classroomMembers: {
                                    include: {
                                        student: true
                                    }
                                }
                            }

                        },
                        subject: true
                    }
                },
                attendance: {
                    include: {
                        student: true,
                        attMethod: true
                    }
                }
            }
        });
        res.json(studingTime);
    }catch(err){
        console.error(err);
        return res.status(500).json({message:"เกิดข้อผิดพลาดในการดึงข้อมูลการเรียน"});
    }
};