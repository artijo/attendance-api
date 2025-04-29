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

export const saveAttendenceByLeader = async (req, res) => {
    const body = req.body;
    // console.log(body);
    const dtNow = DateTime.now();
    if(body){
        try{
            const AttMethodId = await db.attendanceMethod.findFirst({
                where:{
                    attMethodName: "เช็คชื่อด้วยหัวหน้าห้อง"
                },
                select:{
                    attMethodId:true
                }
            });
            // get LeaderId
            const leader = await db.leader.findFirst({
                where: {
                    stdId: req.user.id
                },
                include: {
                    student: true
                }
            });

            //Search Subjectby studingTimeId
            const studyTime = await db.studingTime.findFirst({
                where:{
                    studyTimeId:body[0].studingTimeId
                },
                select:{
                    timetable:{
                        select:{
                            subject:{
                                select:{
                                    subNameThai:true,
                                    subNameEng:true,
                                    teacher:{
                                        select:{
                                            fName:true,
                                            lName:true,
                                        }
                                    },
                                }
                            }
                        }
                    }
                }
            });


            req.body?.map(async (item) => {

                const existingAttendance = await db.attendance.findFirst({
                    where: {
                        AND: [
                            { student: { stdId: item.stdId } },
                            { studingTime: { studyTimeId: item.studingTimeId } }
                        ]
                    }
                });

                const student = await db.studentParent.findMany({
                    where:{
                        stdId:item.stdId
                    },
                    include:{
                        student:true,
                        parent:true
                    }
                });
                
                let attendance;
                
                if (existingAttendance) {
                    // console.log("update attendance");
                    // ถ้ามีข้อมูลอยู่แล้ว ให้อัปเดต
                    // console.log(existingAttendance);
                    attendance = await db.attendance.update({
                        where: { attId: existingAttendance.attId },
                        data: {
                            attTimestamp: dtNow,
                            attStatus: item.attStatus,
                            operatedBy: "Leader",
                            note: item.note,
                            leader: {
                                connect: { ldrId: leader.ldrId }
                            }
                        }
                    });
                    //pushMassage
                    if(student.length > 0){
                        student.map(async (std) => {
                            const lineId = std.parent.lineId;
                            if(lineId){
                                const message = `เรียนผู้ปกครอง ${std.parent.name} \n${formatTitle(std.student.title)}${std.student.fName} ${std.student.lName} ได้ทำการแก้ไขเช็คชื่อเรียนวิชา ${studyTime.timetable.subject.subNameThai} (${studyTime.timetable.subject.subNameEng})\nสอนโดยคุณครู: ${studyTime.timetable.subject.teacher.fName} ${studyTime.timetable.subject.teacher.lName}\nสถานะการเข้าเรียน: ${item.attStatus} \nเวลา: ${dtNow.toFormat('yyyy-MM-dd HH:mm:ss')} หมายเหตุ: ${item.note}\n\n\nการบันทึกนี้ถูกบันทึกโดยหัวหน้าห้อง`;
                                await pushMessageToLine(lineId, message);
                            }
                        });
                    }


                } else {
                    // ถ้าไม่มีข้อมูล ให้สร้างใหม่
                    // console.log("create new attendance");
                    attendance = await db.attendance.create({
                        data: {
                            student: {
                                connect: { stdId: item.stdId }
                            },
                            studingTime: {
                                connect: { studyTimeId: item.studingTimeId }
                            },
                            attMethod: {
                                connect: { attMethodId: AttMethodId.attMethodId }
                            },
                            attTimestamp: dtNow,
                            attStatus: item.attStatus,
                            operatedBy: "Leader",
                            leader: {
                                connect: { ldrId: leader.ldrId }
                            },
                            note: item.note
                        }
                    });
                    
                    //pushMassage
                    if(student.length > 0){
                        student.map(async (std) => {
                            const lineId = std.parent.lineId;
                            if(lineId){
                                const message = `เรียนผู้ปกครอง ${std.parent.name} \n${formatTitle(std.student.title)}${std.student.fName} ${std.student.lName} ได้ทำการเช็คชื่อเรียนวิชา ${studyTime.timetable.subject.subNameThai} (${studyTime.timetable.subject.subNameEng})\nสอนโดยคุณครู: ${studyTime.timetable.subject.teacher.fName} ${studyTime.timetable.subject.teacher.lName}\nสถานะการเข้าเรียน: ${item.attStatus} \nเวลา: ${dtNow.toFormat('yyyy-MM-dd HH:mm:ss')} หมายเหตุ: ${item.note}\n\n\nการบันทึกนี้ถูกบันทึกโดยหัวหน้าห้อง`;
                                await pushMessageToLine(lineId, message);
                            }
                        }
            )}
                }
                
                // console.log(attendance);
            });
            return res.json({message : 'success'});
        }catch(err){
            console.error(err);
            res.json({message : 1})
        };
    }
}