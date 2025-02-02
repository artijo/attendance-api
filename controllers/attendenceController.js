import db from '../prisma/client.js';
import { DateTime } from 'luxon';


export const studentAttendenceSubject = async (req, res) => { // เช็คชื่อเข้าเรียน
    const body = req.body;
    const dtNow = DateTime.fromISO(body.attTimestamp, { zone: 'UTC' });
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

            const attendance = await db.attendance.create({
                data:{
                    // stdId:body.stdId,
                    student: {
                        connect:{
                            stdId:body.stdId
                        }
                    },
                    studingTime: {
                        connect: {
                            studyTimeId: body.studingTimeId
                        }
                    },
                    attMethod: {
                        connect:{
                            attMethodId: AttMethodId.attMethodId
                        }
                    },
                    attTimestamp:dtNow,
                    attStatus:String(attStatusString),
                    latitute:body.latitude,
                    longitute:body.longtitude,
                    operatedBy: "Student"
                }
            })
            console.log(dtNow);
            res.json(attendance);
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

export const getAttendenceBySubject = async (req, res) => {
    const subjectId = req.params.subjectId;
    const classroomId = req.params.classroomId;
    if(subjectId) {
        try{
            const timetables = await db.timetable.findMany({
                where:{
                    AND:{
                        subId:subjectId,
                        classId:classroomId
                    }
                    
                },
                orderBy: [
                    {dayOfWeek : 'asc'},
                    {timeStart : 'asc'}
                ],
            });
            const student = await db.classroomMember.findMany({
                where:{
                    classId:classroomId
                },
                select:{
                    stdId:true,
                    stdNo:true,
                    student:{
                    
                        select:{    
                            fName:true,
                            lName:true,
                            attendance:true
                        }
                    }
                },
                orderBy:{
                    stdNo:'asc'
                }
            });
            const stuidingTime = await db.studingTime.findMany({
                where: {
                    timetableId: {
                        in: timetables.map((timetable) => timetable.timetableId)
                    }
                },
                orderBy: {
                    studingTimeDate:'asc'
                }
            });

            const newData = () => {
                const newStudent = student.map((item) => {
                    const attendence = item.student.attendance.map((item) => item.studingTimeId);
                    const Attendence = stuidingTime.map((studTime) => {
                        if(attendence.includes(studTime.studyTimeId)){
                            return {
                                studyTimeId:studTime.studyTimeId,
                                attId:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attId,
                                attStatus:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attStatus,
                                studingTimeDate:studTime.studingTimeDate,
                            }
                        }else{
                            return {
                                studyTimeId:studTime.studyTimeId,
                                attId:null,
                                attStatus:null,
                                studingTimeDate:studTime.studingTimeDate
                            };
                        };
                    });
                    return {
                        stdId:item.stdId,
                        stdNo:item.stdNo,
                        fName:item.student.fName,
                        lName:item.student.lName,
                        attendance:Attendence
                    };
                });
                return newStudent;
            }
            res.json(newData());
        }catch(err){
            console.error(err);
        };
    };
};

export const getAttendenceByDate = async (req, res) => {
    const date = req.params.date;
    const classroomId = req.params.classroomId;
    if(date && classroomId) {
        try{
            const weekdayOnDateInput = DateTime.fromISO(`${date}T00:00:00Z`, { zone: 'UTC' }).weekday;
            const timetables = await db.timetable.findMany({
                where:{
                    AND:{
                        classId:classroomId,
                        dayOfWeek:weekdayOnDateInput
                    }
                },
            });

            const stuidingTime = await db.studingTime.findMany({
                where: {
                    AND:[
                        {timetableId: {
                            in: timetables.map((timetable) => timetable.timetableId)
                        }},
                        {studingTimeDate:{
                            gte:DateTime.fromISO(`${date}T00:00:00Z`, { zone: 'UTC' }),
                        }}
                    ]
                },
                include:{
                    timetable:{
                        include:{
                            subject:true
                        }
                    }
                },
                orderBy: {
                    studingTimeDate:'asc'
                }
            });
            if(stuidingTime.length == 0) return res.json([]);

            const student = await db.classroomMember.findMany({
                where:{
                    classId:classroomId
                },
                select:{
                    stdId:true,
                    stdNo:true,
                    student:{
                        select:{    
                            fName:true,
                            lName:true,
                            stdId:true,
                            attendance:true
                        }
                    }
                },
                orderBy:{
                    stdNo:'asc'
                }
            });

            const newData = () => {
                const newStudent = student.map((item) => {
                    const attendence = item.student.attendance.map((item) => item.studingTimeId);
                    const Attendence = stuidingTime.map((studTime) => {
                        if(attendence.includes(studTime.studyTimeId)){
                            return {
                                studyTimeId:studTime.studyTimeId,
                                subjectName:studTime.timetable.subject.subNameThai,
                                subjectCode:studTime.timetable.subject.subCode,
                                attId:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attId,
                                attStatus:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attStatus,
                                studingTimeDate:studTime.studingTimeDate
                            }
                        }else{
                            return {
                                studyTimeId:studTime.studyTimeId,
                                subjectName:studTime.timetable.subject.subNameThai,
                                subjectCode:studTime.timetable.subject.subCode,
                                attId:null,
                                attStatus:null,
                                studingTimeDate:studTime.studingTimeDate
                            };
                        };
                    });
                    return {
                        stdId:item.stdId,
                        stdNo:item.stdNo,
                        fName:item.student.fName,
                        lName:item.student.lName,
                        attendance:Attendence
                    };
                });
                return newStudent;
            }
            const data = newData();
            // console.log(data[0].attendance);
            res.json(data);  
        }catch(err){
            console.error(err);
        };
    }
};

export const getAttendenceSummaryByClassroom = async (req, res) => {
    const classroomId = req.params.classroomId;
    // console.log(classroomId);

    if(classroomId){
        try{

            const timetables = await db.timetable.findMany({
                where:{
                    classId:classroomId
                },
                include:{
                    studyTime:true
                }
            })

            let studyCount = 0;
            for(let timetableIndex = 0; timetableIndex < timetables.length; timetableIndex++){
                // console.log(timetables[timetableIndex].studyTime.length);
                studyCount += timetables[timetableIndex].studyTime.length;
            }
            // console.log(studyCount);
            
            const studyTimeIdArray = timetables.map((timetable) => timetable.studyTime.map((studyTime) => studyTime.studyTimeId)).flat();
            // console.log(studyTimeIdArray);
            const student = await db.classroomMember.findMany({
                where:{
                    classId:classroomId,
                    student:{
                        attendance:{
                            every:{
                                studingTimeId:{
                                    in:studyTimeIdArray
                                }
                            }
                        }
                    }
                },
                select:{
                    student:{
                        select:{
                            stdId:true,
                            title:true,
                            fName:true,
                            lName:true,
                            attendance:true
                        }
                    },
                    stdNo:true
                },
                orderBy:{
                    stdNo:'asc'
                }
            })
            const summaryList = student.map((std) => {
                const attendenceCount = std.student.attendance.filter((att) => att.attStatus === 'PRESENT').length;
                const attendenceLateCount = std.student.attendance.filter((att) => att.attStatus === 'LATE').length;
                const attendenceLeaveCount = std.student.attendance.filter((att) => att.attStatus === 'LEAVE').length;
                const attendenceActivity = std.student.attendance.filter((att) => att.attStatus === 'ACTIVITY').length;
                const attendenceAbsentCount = studyCount - attendenceCount - attendenceLateCount - attendenceLeaveCount;

                function calculateAttendenceCount(){
                    let percent = ((attendenceCount+attendenceLeaveCount) / studyCount) * 100;   
                    return percent.toFixed(1);
                }
                const attendencePercent = calculateAttendenceCount();
                return {
                    stdId:std.student.stdId,
                    stdNo:std.stdNo,
                    title:std.student.title,
                    fName:std.student.fName,
                    lName:std.student.lName,
                    attendenceCount:attendenceCount,
                    attendenceLateCount:attendenceLateCount,
                    attendenceLeaveCount:attendenceLeaveCount,
                    attendenceAbsentCount:attendenceAbsentCount,
                    attendenceActivity:attendenceActivity,
                    attendencePercent:attendencePercent,
                    canExam:attendencePercent >= 80 ? "-" : "มส."
                    // attendence:attendence
                }
            })
            // console.log(summaryList);
            res.json(summaryList);
        }catch(err){
            console.error(err);
        };
    }else{
        res.status(404).json({msg:"no classroomId"})
    }
};

export const getAttendenceSummaryByPerson = async (req, res) => {
    const studentId = req.params.studentId;
    if(studentId){
        try{

        }catch(error){
            console.error(error);
        }
    }
}