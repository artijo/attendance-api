import db from '../prisma/client.js';
import { DateTime } from 'luxon';



export const getTimeTable = async (req, res) => {
    const classId = req.params.classroomId;
    const dayOfWeek = req.params.dayOfWeek;

    try{
        const timetables = await db.timetable.findMany({
            where:{
                AND:{
                    classId:String(classId),
                    dayOfWeek: Number(dayOfWeek),
                }
            },
            orderBy:{
                timeStart:'asc'
            },
        });

        const formatTime = (time) => {
            const timeInBangkok = DateTime.fromISO(time, { zone: 'UTC' }).setZone('Asia/Bangkok');
            return timeInBangkok.toISO();
        }
    
        
        let arrayOfTimeToAttendence = [];

        for(const timetable of timetables) {
            const st = await db.studingTime.findMany({
                where: {
                    // studingTimeDate: formatTime("2024-12-19T22:00:00.000Z") // ใช้เวลาในรูปแบบ ISO 8601 ที่แปลงแล้ว
                    timetableId: timetable.timetableId,
                    studingTimeDate : formatTime(timetable.timeStart)
                },
                orderBy:{
                    studingTimeDate:'asc'
                },
                select:{
                    studyTimeId:true,
                    attendance:true,
                    studingTimeDate:true,
                    timetable:{
                        select:{
                            subject:{
                                select:{
                                    subNameEng:true,
                                    subNameThai:true,
                                }
                            },
                            timeStart:true,
                            timeLate:true,
                            timeEnd:true
                        }
                    }
                }
            });
            arrayOfTimeToAttendence.push(...st);
        };
        // console.log(arrayOfTimeToAttendence[0].studingTimeDate.toISOString())
        res.json(arrayOfTimeToAttendence);
    }catch(err) {
        console.error(err);
    };
};