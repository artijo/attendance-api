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
                            attendance:true,
                            title:true
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

            const term = await db.classrooms.findFirst({
                where:{
                    classId:classroomId
                },
                select:{
                    term:true
                }
            })
            let months = [];
            const startDateTime = DateTime.fromJSDate(term.term.termStart).setZone('Asia/Bangkok');
            const endDateTime = DateTime.fromJSDate(term.term.termEnd).setZone('Asia/Bangkok');
            for(let m = startDateTime.month; m <= endDateTime.month; m++){
                months.push(m);
            }
            const newData = () => {
                const newStudent = student.map((item) => {
                    const attendence = item.student.attendance.map((item) => item.studingTimeId);
                    const Attendence = stuidingTime.map((studTime) => {
                        const month = DateTime.fromJSDate(studTime.studingTimeDate).month;
                        if(attendence.includes(studTime.studyTimeId)){
                            return {
                                studyTimeId:studTime.studyTimeId,
                                attId:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attId,
                                attStatus:item.student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attStatus,
                                studingTimeDate:studTime.studingTimeDate,
                                month: month
                            }
                        }else{
                            return {
                                studyTimeId:studTime.studyTimeId,
                                attId:null,
                                attStatus:null,
                                studingTimeDate:studTime.studingTimeDate,
                                month: month
                            };
                        };
                    });
                    return {
                        stdId:item.stdId,
                        stdNo:item.stdNo,
                        title:item.student.title,
                        fName:item.student.fName,
                        lName:item.student.lName,
                        attendance:Attendence
                    };
                });
                
                return newStudent;
            }
            res.status(200).json({data:newData(),month:months});

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
            const weekdayOnDateInput = DateTime.fromISO(`${date}T00:00:00`).setZone('Asia/Bangkok').weekday;
            const timetables = await db.timetable.findMany({
                where:{
                    AND:[
                        {classId:classroomId},
                        {dayOfWeek:weekdayOnDateInput}
                    ]
                },
            });
            // console.log(timetables);
            const stuidingTime = await db.studingTime.findMany({
                where: {
                    AND:[
                        {
                            timetableId: {
                                in: timetables.map((timetable) => timetable.timetableId)
                            }
                        },
                        {
                            studingTimeDate:  {
                                in:timetables.map((timetable) => DateTime.fromISO(`${date}T${timetable.timeStart}`).setZone('Asia/Bangkok'))
                            }
                        }
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
    if(classroomId){
        try{

            const timetables = await db.timetable.findMany({
                where:{
                    classId:classroomId,
                },
                include:{
                    studyTime:true
                }
            })
            let studyCount = 0;
            for(let timetableIndex = 0; timetableIndex < timetables.length; timetableIndex++){
                studyCount += timetables[timetableIndex].studyTime.length;
            }
            const studyTimeIdArray = timetables.map((timetable) => timetable.studyTime.map((studyTime) => studyTime.studyTimeId)).flat();
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
                    stdNo:true,
                    behaviourScore:true
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
                    behaviourScore: std.behaviourScore,
                    canExam:attendencePercent >= 80 ? "-" : "มส."
                }
            })
            res.json(summaryList);
        }catch(err){
            console.error(err);
        };
    }else{
        res.status(404).json({msg:"no classroomId"})
    }
};


export const getAttendenceSummaryBySubjectIsExam = async (req, res) => {
    const classroomId = req.params.classroomId;
    const subjectId = req.params.subjectId;
    if(classroomId){
        try{
            const timetables = await db.timetable.findMany({
                where:{
                    classId:classroomId,
                    subId:subjectId                    
                },
                include:{
                    studyTime:true
                },
            
            })
            let studyCount = 0;
            for(let timetableIndex = 0; timetableIndex < timetables.length; timetableIndex++){
                studyCount += timetables[timetableIndex].studyTime.length;
            }
            const studyTimeIdArray = timetables.map((timetable) => timetable.studyTime.map((studyTime) => studyTime.studyTimeId)).flat();
            

            const oldStudent = await db.classroomMember.findMany({
                where:{
                    classId:classroomId,
                    student:{
                        attendance:{
                            some:{
                                studingTimeId:{in:studyTimeIdArray}
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
                            attendance:{
                                select:{
                                    attStatus:true,
                                    studingTimeId:true,
                                    studingTime:{
                                        select:{
                                            timetable:{
                                                select:{
                                                    subject:{
                                                        select:{
                                                            subNameThai:true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    stdNo:true
                },
                orderBy:{
                    stdNo:'asc',
                }
            })

            const student = oldStudent.map((std, index) => {
                const attendance = std.student.attendance.filter((att) => studyTimeIdArray.includes(att.studingTimeId));
                return (
                    {
                        stdNo:std.stdNo,
                        student: {
                            stdId:std.student.stdId,
                            title:std.student.title,
                            fName:std.student.fName,
                            lName:std.student.lName,
                            attendance: attendance
                        }
                    }
                )
            })
            // console.log(student.student);
            const summaryList = student.map((std) => {
                // for(const wow of std.student.attendance){
                //     console.log(wow.studingTime.timetable.subject.subNameThai)
                // }

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
                }
            })
            // console.log(summaryList);
            console.log(summaryList);
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

export const saveAttendenceByTeacher = async (req, res) => {
    const body = req.body;
    const dtNow = DateTime.now();
    if(body){
        try{
            const AttMethodId = await db.attendanceMethod.findFirst({
                where:{
                    attMethodName: "เช็คชื่อด้วยคุณครู"
                },
                select:{
                    attMethodId:true
                }
            });

            req.body?.map(async (item) => {
                // const attendance = await db.attendance.create({
                //     data:{
                //         student: {
                //             connect:{
                //                 stdId:item.stdId
                //             }
                //         },
                //         studingTime: {
                //             connect: {
                //                 studyTimeId: item.studingTimeId
                //             }
                //         },
                //         attMethod: {
                //             connect:{
                //                 attMethodId: AttMethodId.attMethodId
                //             }
                //         },
                //         attTimestamp:dtNow,
                //         attStatus:item.attStatus,
                //         operatedBy: "Teacher",
                //         teacher: {
                //             connect:{
                //                 tchId: req.user.id
                //             }
                //         },
                //         note:item.note
                //     }
                // })

                const existingAttendance = await db.attendance.findFirst({
                    where: {
                        AND: [
                            { student: { stdId: item.stdId } },
                            { studingTime: { studyTimeId: item.studingTimeId } }
                        ]
                    }
                });
                
                let attendance;
                
                if (existingAttendance) {
                    console.log("update attendance");
                    // ถ้ามีข้อมูลอยู่แล้ว ให้อัปเดต
                    // console.log(existingAttendance);
                    attendance = await db.attendance.update({
                        where: { attId: existingAttendance.attId },
                        data: {
                            attTimestamp: dtNow,
                            attStatus: item.attStatus,
                            operatedBy: "Teacher",
                            note: item.note,
                            teacher: {
                                connect: { tchId: req.user.id }
                            }
                        }
                    });
                } else {
                    // ถ้าไม่มีข้อมูล ให้สร้างใหม่
                    console.log("create new attendance");
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
                            operatedBy: "Teacher",
                            teacher: {
                                connect: { tchId: req.user.id }
                            },
                            note: item.note
                        }
                    });
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

export const abstactAttendenceBySubject = async (req, res) => {
    const classroomId = req.params.classId;
    const studentId = req.params.stdId;
    // console.log("classId:"+classroomId);
    // console.log("studentId:"+studentId);
    try{
        const timetables = await db.timetable.findMany({
            where:{
                classId: classroomId
            }
        });
        const subjectId = [...new Set(timetables.map((timetable) => timetable.subId))];
        const student = await db.classroomMember.findFirst({
            where:{
                classId: classroomId,
                stdId: studentId
            },
            include:{
                student:true,
                // classroom:true
            }
        })
        // console.log(student);
        async function abstact(){
            let abstact = { studentInfo:student };
            // console.log(abstact);
            for(const subject of subjectId){
                abstact = { ...abstact, 
                    [subject] : {
                        attendenceCount:0,
                        attendenceLateCount:0,
                        attendenceLeaveCount:0,
                        attendenceAbsentCount:0,
                        attendenceActivity:0,
                        attendencePercent:0,
                        canExam:"-"
                    }
                };
            };
            
            const abstactKeyObject = Object.keys(abstact);
            for(let i = 1; i < abstactKeyObject.length ; i++){
                const timetables = await db.timetable.findMany({
                    where : {
                        classId:classroomId,
                        subId: abstactKeyObject[i]
                    }
                })
                console.log(timetables);
                const studyTimes = await db.studingTime.findMany({ // เอาไว้ค้นหา attendence
                    where : {
                        timetableId: {
                            in:timetables.map((timetable) => timetable.timetableId)
                        },
                        
                    },
                });
                
                if(!studyTimes.length > 0) {
                    abstact = {...abstact, 
                        [abstactKeyObject[i]] : {
                            attendenceCount:null,
                            attendenceLateCount:null,
                            attendenceLeaveCount:null,
                            attendenceAbsentCount:null,
                            attendenceActivity:null,
                            attendencePercent:null,
                            canExam:"-"
                        }

                    }
                }else if(studyTimes.length > 0){
                    let studyCount = studyTimes.length;
                    const attendance = await db.attendance.findMany({
                        where: {
                            stdId:studentId,
                            studingTimeId:{
                                in:studyTimes.map((styTime) => styTime.studyTimeId)
                            }
                        }
                    })
                    
                    const attendenceCount = attendance.filter((att) => att.attStatus === 'PRESENT').length;
                    const attendenceLateCount = attendance.filter((att) => att.attStatus === 'LATE').length;
                    const attendenceLeaveCount = attendance.filter((att) => att.attStatus === 'LEAVE').length;
                    const attendenceActivity = attendance.filter((att) => att.attStatus === 'ACTIVITY').length;
                    const attendenceAbsentCount = studyCount - attendenceCount - attendenceLateCount - attendenceLeaveCount;

                    function calculateAttendenceCount(){
                        let percent = ((attendenceCount+attendenceLeaveCount) / studyCount) * 100;   
                        return percent.toFixed(1);
                    }

                    const attendencePercent = calculateAttendenceCount();
                    const canExam = attendencePercent >= 80 ? "-" : "มส.";

                    abstact = {...abstact, 
                        [abstactKeyObject[i]] : {
                            attendenceCount:attendenceCount,
                            attendenceLateCount:attendenceLateCount,
                            attendenceLeaveCount:attendenceLeaveCount,
                            attendenceActivity:attendenceActivity,
                            attendenceAbsentCount:attendenceAbsentCount,
                            attendencePercent:attendencePercent,
                            canExam:canExam
                        }
                    }
                }
            }
            return abstact;
        }
        res.status(200).json(await abstact());
        
    }catch(error) {
        console.error(error);
        res.status(500).json({message: error});
    }
}


export const abstactAttendenceBySubjectAndStudent = async (req, res) => {
    
}