import db from '../prisma/client.js';
import { DateTime } from 'luxon';


export const studentAttendenceSubject = async (req, res) => {
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

