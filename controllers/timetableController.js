import db from '../prisma/client.js';
import { DateTime } from 'luxon';

export const createTimetable = async (req, res) => {
    const { subject, timelate , periodtime, classroom, day } = req.body;
    // console.log(req.body);
    if (subject && timelate && periodtime && classroom && day) {
        try {
            console.log(periodtime);
            const timelateDatetime = DateTime.fromISO(periodtime.startDatabaseFormat).setZone('Asia/Bangkok').plus({minutes:timelate});
            const timelateDatabaseFormat = timelateDatetime.toFormat('HH:mm:ss');
            await db.timetable.create({
                data:{
                    subId: subject.subId,
                    classId: classroom.classId,
                    timeStart: periodtime.startDatabaseFormat,
                    timeEnd:periodtime.endDatabaseFormat,
                    timeLate: timelateDatabaseFormat,
                    dayOfWeek: Number(day)
                }
            })
            res.status(200).json({ message: "สร้างสำเร็จ"})
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "เกิดข้อผิดพลาดในขณะสร้างคาบตารางเรียน" });
        }
    } else {
        res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
    }
};

export const editTimetable = async (req, res) => {
    const { timetable, subject, periodtime, timelate  } = req.body;
    if (timetable && subject && periodtime && timelate) {
        try {
            const timelateDatetime = DateTime.fromISO(periodtime.startDatabaseFormat).setZone('Asia/Bangkok').plus({minutes:timelate});
            const timelateDatabaseFormat = timelateDatetime.toFormat('HH:mm:ss');
            await db.timetable.update({
                where:{
                    timetableId:timetable.timetableId
                },
                data:{
                    subId:subject.subId,
                    classId:timetable.classId,
                    timeStart: periodtime.startDatabaseFormat,
                    timeEnd:periodtime.endDatabaseFormat,
                    timeLate: timelateDatabaseFormat,
                    dayOfWeek:Number(timetable.dayOfWeek)
                }
            })
            res.status(200).json({ message: "แก้ไขสำเร็จ"})
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "เกิดข้อผิดพลาดในขณะสร้างคาบตารางเรียน" });
        }
    } else {
        res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
    }
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
                select:{
                    timetableId:true,
                    dayOfWeek:true,
                    timeStart:true,
                    timeEnd:true,
                    timeLate:true,
                    subId:true,
                    classId:true,
                    classroom:{
                        select:{
                            classId:true,
                            classLevel:true,
                            classRoom:true,
                            term:{
                                select:{
                                    semester:true,
                                    academicYear:true
                                }
                            },
                            // academicYear:true,
                            // semester:true,
                            leader:{
                                select:{
                                    ldrId:true,
                                    fName:true,
                                    lName:true,
                                }
                            },
                            classroomType:{
                                select:{
                                    classTypeId:true,
                                    classTypeNameEng:true,
                                    classTypeNameThai:true,
                                }
                            }

                        }
                    },
                    subject:{
                        select:{
                            subId:true,
                            subNameEng:true,
                            subNameThai:true,
                            subCode:true,
                            subCredit:true,
                            teacher:{
                                select:{
                                    tchId:true,
                                    fName:true,
                                    lName:true,
                                }
                            }
                        }
                    }
                }
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
            res.status(500).json({ error: "error qurey timetable." });
        };
    }else {
        res.status(400).json({ error: "Invalid input data." });
    };
};

export const deleteTimetable =async (req, res) => {
    const timetableId = req.params.timetableId;
    if(timetableId){    
        try{
            const studyingTime = await db.studingTime.findMany({
                where:{
                    timetableId:timetableId
                }
            });

            const studyTimeId = studyingTime.map((item) => item.studyTimeId);

            const attendance = await db.attendance.deleteMany({
                where:{
                    studingTimeId:{
                        in:studyTimeId
                    }
                }
            })
            
            const studyingTimeDelete = await db.studingTime.deleteMany({    
                where:{
                    timetableId:timetableId
                }
            });

            const timetable = await db.timetable.delete({
                where:{
                    timetableId:timetableId
                }
            });
            
            res.json("delete successfully!");
        }catch(err){
            console.error(err);
        };
    };
};

export const getSubjectTimetable = async (req, res) => {
    const classroomId = req.params.classroomId;
    if(classroomId){
        try{
            const timetables = await db.timetable.findMany({
                where:{
                    classId : classroomId
                },
                orderBy: [
                    {dayOfWeek : 'asc'},
                    {timeStart : 'asc'}
                ],
                select:{
                    classroom:{
                        select:{
                            classId:true
                        }
                    },
                    subject:{
                        select:{
                            subId:true,
                            subNameEng:true,
                            subNameThai:true,
                            subCode:true,
                            subCredit:true,
                            teacher:{
                                select:{
                                    tchId:true,
                                    fName:true,
                                    lName:true,
                                }
                            }
                        }
                    }
                }
            });
            const listSubject = timetables.map((item) => item.subject);
            const uniqueSubject = listSubject.filter((value, index, self) => self.findIndex((item) => item.subId === value.subId) === index);
            // console.log([...uniqueSubject]);
            res.json(uniqueSubject);   
        }catch(err){
            console.error(err);
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
                // console.log(st)
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


export const getTeacherTimetable = async (req, res) => {
    const body = req.body;
    const subjectArr = body.subject;
    if(subjectArr.lenght == 0) return res.status(401).json({ message : "ไม่มี subjectArr"});
    //วันนี้
    const dateTimeNow = DateTime.now();
    const date = dateTimeNow.toString().split("T")[0];
    // console.log(dateTimeNow);
    ///////
    try{
        // function เปรียบเทียบวันเวลา

        function isSchoolOpen(dateStr) {
            const startDate = DateTime.fromJSDate(dateStr.termStart, {zone: 'UTC'}); // วันที่เริ่มเปิดเทอม
            const endDate = DateTime.fromJSDate(dateStr.termEnd, {zone: 'UTC'});   // วันที่ปิดเทอม
            const checkDate = DateTime.fromISO(date, {zone: 'UTC'});      // วันที่ที่ต้องการตรวจสอบ
            
            if(checkDate >= startDate && checkDate <= endDate){
                return true;
            }else{
                return false;
            };
        };

        // หาว่าวันปัจจุบัน 
        const termLists = await db.academicTerms.findMany({});
        let termId;
        for(const term of termLists) {
            if(isSchoolOpen(term)){
                termId = term.termId;
            }
        };

        //หาห้องที่อยู่ในเทอมนี้
        const classrooms = await db.classrooms.findMany({
            where: {
                termId: termId
            }
        })

        const timetables = await db.timetable.findMany({
            where: {
                AND:[
                    {
                        classId:{
                            in:classrooms.map((item) => item.classId)
                        }
                    },
                    {
                        subId:{
                            in:subjectArr.map((sub) => sub.subId)
                        }
                    }
                ]
            },
            include:{
                classroom:true,
                subject:true
            },
            orderBy:[
                {
                    classroom:{
                        classRoom:'asc'
                    }
                },
                {
                    timeStart:'asc'
                }
            ]
        })

        const day = {
            1:[
                ...timetables.filter((timetable) => timetable.dayOfWeek === 1)
            ],
            2:[
                ...timetables.filter((timetable) => timetable.dayOfWeek === 2)
            ],
            3:[
                ...timetables.filter((timetable) => timetable.dayOfWeek === 3)
            ],
            4:[
                ...timetables.filter((timetable) => timetable.dayOfWeek === 4)
            ],
            5:[
                ...timetables.filter((timetable) => timetable.dayOfWeek === 5)
            ]
        }

        res.status(200).json(day);
    }catch(error) {
        console.error(error)
    }
}