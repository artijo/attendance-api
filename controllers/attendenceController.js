import db from '../prisma/client.js';
import { DateTime } from 'luxon';


export const studentAttendenceSubject = async (req, res) => { // เช็คชื่อเข้าเรียน
    const body = req.body;
    const dtNow = DateTime.fromISO(body.attTimestamp, { zone: 'UTC' }).setZone('Asia/Bangkok');
    let attStatusString = '';
    if(dtNow.minute <= Number(body.timeLate[1])){
        attStatusString = 'PRESENT'
    }else if(dtNow.minute > Number(body.timeLate[1])){
        attStatusString = 'LATE'
    }else if(dtNow.hour > Number(body.timeLate[0]) && dtNow.minute > 0 && dtNow.second > 0){
        attStatusString = 'LEAVE'
    }
    if(body){
        try{
            const AttMethodId = await db.attendanceMethod.findFirst({
                where:{
                    attMethodName: "เช็คชื่อด้วยระบบ Gps"
                },
                select:{
                    attMethodId:true
                }
            });

            await db.attendance.create({
                data:{
                    stdId:body.stdId,
                    studingTimeId:body.studingTimeId,
                    attTimestamp:dtNow,
                    attMethodId:AttMethodId.attMethodId,
                    attStatus:String(attStatusString),
                    latitute:body.latitude,
                    longitute:body.longtitude,
                    operatedBy: "Student"
                }
            })
            res.json({message : 0})
        }catch(err){
            console.error(err);
            res.json({message : 1})
        };
    }
};

export const getAllStudentClassroomTerm = async (req, res) => {
    const stdId = req.query.student;
    if(stdId) {
        try{
            const classroomStudent = await db.classroomMember.findMany({
                where:{
                    stdId : stdId
                },
                select:{
                    classId:true,
                    classroom:true
                }
            })
            res.json(classroomStudent)
        }catch(err){
            console.error(err);
        };
    }
    
};

export const getSubjectTimetableByClassroom = async (req, res) => {
    const classId = req.query.classroom;
    if(classId) {
        try{
            const timetableSubject = await db.timetable.findMany({
                where:{
                    classId:classId
                },
                select:{
                    subId:true,
                    subject:true
                }
            });
            res.json(timetableSubject);
        }catch(err){
            console.error(err);
        };
    };
};

export const attendanceHistorySearchByTermAndSubjectId = async (req, res) => {
    const classroomId = req.query.classroom;
    const subjectId = req.query.subject;
    const studentId = req.query.student;
    // console.log(classroomId+ "  " + subjectId);
    try{
        const timetableId = await db.timetable.findMany({
            where: {
                classId: classroomId,
                subId: subjectId,
            }
        })

        const timetableIdArray = timetableId.map((value) => 
            value.timetableId
        )

        const studingTime = await db.studingTime.findMany({
            where :{ 
                timetableId:{
                    in: timetableIdArray
                }
            },
            orderBy: {
                studingTimeDate:'asc'
            },
            select : {
                studyTimeId:true,
                timetable:true,
                attendance:{
                    where:{
                        stdId:studentId
                    },
                    select:{
                        attId:true,
                        attMethod:{
                            select:{
                                attMethodName:true
                            }
                        },
                        attStatus:true,
                        attTimestamp:true,
                        latitute:true,
                        longitute:true,
                        note:true,
                        operatedBy:true,
                        stdId:true,
                        studingTime:{
                            select:{
                                studingTimeDate:true,
                            }
                        },
                        teacher:true,
                        leader:true,
                    }
                }
            }
        })
        res.json(studingTime);
    }catch(err) {
        console.error(err);
    };
};

// export const getStudentClassroomTerm = async (req, res) => {
//     const stdId = req.params.stdId;
//     try{
//         const studentTerm = await db.student.findFirst({
//             where : {
//                 stdId: stdId
//             },
//             select:{
//                 classroomMembers:{
//                     orderBy:{
//                         classroom:{
//                             academicYear:'asc',
//                         }
//                     },
//                     select:{
//                         classroom:true,
//                     }
//                 }
//             }
//         });
//         res.json(studentTerm.classroomMembers);
//     }catch(err) {
//         console.error(err);
//     };
// };

// export const attendenceBySubjectAndStuId = async (req, res) => {
//     const classroomId = req.params.classroomId;
//     const studentId = req.params.studentId;
//     try{
//         const attendenceBySubject = await db.timetable.findMany({
//             where:{
//                 classId: String(classroomId),
//             },
//             select: {
//                 subject:true,
//                 studyTime:{
//                     select:{
//                         attendance:{
//                             orderBy:{
//                                 createdAt:'asc'
//                             },
//                             where:{
//                                 stdId:studentId
//                             }
//                         }
//                     }
//                 }
//             }
//         });


//         res.json(attendenceBySubject);
//     }catch(err) {
//         console.error(err);
//     };
// };

