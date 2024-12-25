import db from '../prisma/client.js';
import { DateTime } from 'luxon';


export const createTimetable = async (req, res) => {
    const { classroomId, timetable } = req.body



    if(classroomId && timetable){
        try{
            console.log(classroomId + timetable);
        }catch(error){
            console.log(error)
        }
    };
};




export const getTimeTableByRoom = async (req, res) => {
    const classid = req.query.classroomid;
    if(classid) {
        try{
            const timetable = await db.timetable.findMany({
                where:{
                    classId : classid
                },
                orderBy: [
                    {dayOfWeek : 'asc'},
                    {timeStart : 'asc'}
                ],
            });

            const dayOfWeek = {
                "1" : [],
                "2" : [],
                "3" : [],
                "4" : [],
                "5" : []
            }
            
            const arrayOfDayOfWeek = Object.keys(dayOfWeek);

            arrayOfDayOfWeek.forEach(objectKey => {
                timetable.forEach(subjecttimetable => {
                    if(Number(objectKey) === Number(subjecttimetable.dayOfWeek)){
                        dayOfWeek[objectKey].push(subjecttimetable)
                    }
                })
            });
        
            // console.log(timetable);
            res.json(dayOfWeek);
        }catch(error){
            console.log(error);
        };
    };
};


export const getTimeTable = async (req, res) => { // ใช้สำหรับการส่งข้อมูลตารางเรียนว่าวันนั้นเรียนวิชาอะไรบ้าง
    const classId = req.params.classroomId;
    const dayOfWeek = req.params.dayOfWeek;
    if(classId && dayOfWeek ) {
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
                const dt = DateTime.now();
                const utfString = `${dt.year}-${dt.month}-${dt.day}T${time}`;
                const timeInBangkok = DateTime.fromISO(utfString, { zone: 'UTC' });
                return timeInBangkok;
            }

            let arrayOfTimeToAttendence = [];
            for(const timetable of timetables) {
                // console.log(`timetable Id is ${timetable.timetableId} and studinTime is ${formatTime(timetable.timeStart)}`);
                const st = await db.studingTime.findMany({
                    where: {
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
                console.log(st)
                arrayOfTimeToAttendence.push(...st);
            };
            res.json(arrayOfTimeToAttendence);
        }catch(err) {
            console.error(err);
        };
    }else{
        console.log('pls enter params')
    }
    
};