import db from '../prisma/client.js';
import { DateTime } from 'luxon';
import { pushMessageToLine } from '../helper/line.js';
import { formatTitle } from '../helper/helper.js';


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

export const getAttendenceByDateAndStudnet = async (req, res) => {
    const { date, classroom, student } = req.body;
    // console.log(classroom);
    // console.log(student);
    if(date && classroom && student) {
        try{
            const getStudent = await db.student.findFirst({
                where:{
                    AND:[
                        {stdId:student.stdId},
                        {classroomMembers:{
                            every:{
                                classId:classroom.classId
                            }
                        }}
                    ]
                },
                include:{
                    attendance:true,
                    classroomMembers:true
                }
            });
            const weekday = DateTime.fromISO(`${date}T00:00:00`).setZone('Asia/Bangkok').weekday;
            const timetable = await db.timetable.findMany({
                where:{
                    AND:[
                        {classId:classroom.classId},
                        {dayOfWeek: weekday}
                    ]
                }
            });

            // console.log(timetable);
            const listOfTimetableId = timetable.map((timetable) => timetable.timetableId);
            const listOfTimetableDate = timetable.map((timetable) => DateTime.fromISO(`${date}T${timetable.timeStart}`).setZone('Asia/Bangkok'));
            const studyTime = await db.studingTime.findMany({
                where: {
                    AND: [
                        { timetableId: { in: listOfTimetableId } },
                        { studingTimeDate: { in: listOfTimetableDate } } 
                    ]
                },
                include: {
                    timetable: {
                        include: {
                            subject: true
                        }
                    }
                },
                orderBy: {
                    studingTimeDate: 'asc' 
                }
            });
            
            const isAttendece = getStudent.attendance.map((item) => item.studingTimeId);
            const abstactAttendece = studyTime.map((studTime) => {
                if(isAttendece.includes(studTime.studyTimeId)){
                    return {
                        studyTimeId:studTime.studyTimeId,
                        subjectName:studTime.timetable.subject.subNameThai,
                        subjectCode:studTime.timetable.subject.subCode,
                        attId:student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attId,
                        attStatus:student.attendance.find((att) => att.studingTimeId === studTime.studyTimeId).attStatus,
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
            // console.log(getStudent.classroomMembers[0].stdNo);
            const newStudent = {
                stdNo:getStudent.classroomMembers[0].stdNo,
                stdId:getStudent.stdId,
                title:getStudent.title,
                fName:getStudent.fName,
                lName:getStudent.lName,
                email:getStudent.email,
                attendance: abstactAttendece
            }
            res.status(200).send(newStudent);
        }catch(err){
            console.error(err);
        };
    }else{
        return res.status(400).send({message:"bad requset"});
    };
}

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
                            title:true,
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
                        title:item.student.title,
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

export const saveAttendenceByTeacher = async (req, res) => {
    const body = req.body;
    // console.log(body);
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
                            operatedBy: "Teacher",
                            note: item.note,
                            teacher: {
                                connect: { tchId: req.user.id }
                            }
                        }
                    });
                    //pushMassage
                    if(student.length > 0){
                        student.map(async (std) => {
                            const lineId = std.parent.lineId;
                            if(lineId){
                                const message = `เรียนผู้ปกครอง ${std.parent.name} \n${formatTitle(std.student.title)}${std.student.fName} ${std.student.lName} ได้ทำการแก้ไขเช็คชื่อเรียนวิชา ${studyTime.timetable.subject.subNameThai} (${studyTime.timetable.subject.subNameEng})\nสอนโดยคุณครู: ${studyTime.timetable.subject.teacher.fName} ${studyTime.timetable.subject.teacher.lName}\nสถานะการเข้าเรียน: ${item.attStatus} \nเวลา: ${dtNow.toFormat('yyyy-MM-dd HH:mm:ss')} หมายเหตุ: ${item.note}\n\n\nการบันทึกนี้ถูกบันทึกโดยคุณครูประจำวิชา`;
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
                            operatedBy: "Teacher",
                            teacher: {
                                connect: { tchId: req.user.id }
                            },
                            note: item.note
                        }
                    });
                    
                    //pushMassage
                    if(student.length > 0){
                        student.map(async (std) => {
                            const lineId = std.parent.lineId;
                            if(lineId){
                                const message = `เรียนผู้ปกครอง ${std.parent.name} \n${formatTitle(std.student.title)}${std.student.fName} ${std.student.lName} ได้ทำการเช็คชื่อเรียนวิชา ${studyTime.timetable.subject.subNameThai} (${studyTime.timetable.subject.subNameEng})\nสอนโดยคุณครู: ${studyTime.timetable.subject.teacher.fName} ${studyTime.timetable.subject.teacher.lName}\nสถานะการเข้าเรียน: ${item.attStatus} \nเวลา: ${dtNow.toFormat('yyyy-MM-dd HH:mm:ss')} หมายเหตุ: ${item.note}\n\n\nการบันทึกนี้ถูกบันทึกโดยคุณครูประจำวิชา`;
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


export const studentAttendenceEnrollment = async (req, res) => {
    const { enrollmentInfo, location } = req.body;
    const studentId = req.user.id;

    function statusEnrollment(sTime, lTime, enrollmentTime) {
        const startTime = DateTime.fromISO(sTime).setZone('Asia/Bangkok');
        const lateTime = DateTime.fromISO(lTime).setZone('Asia/Bangkok');
        const lateMinute = startTime.diff(lateTime, 'minutes').minutes;
        const enrollmentMinute = enrollmentTime.diff(startTime, 'minutes').minutes;
        if(enrollmentMinute <= lateMinute){
            return "PRESENT";
        }else if(enrollmentMinute > lateMinute){
            return "LATE";
        }
    }
    // console.log(enrollmentInfo);
    if(enrollmentInfo && location && studentId) {
        // console.log(enrollmentInfo);
        // console.log(studentId);
        // console.log(location);
        try{
            const dtNow = DateTime.now().setZone('Asia/Bangkok'); 

            const attendanceMethod = await db.attendanceMethod.findFirst({
                where:{
                    attMethodName: "เช็คชื่อด้วยระบบ Gps"
                },
                select:{
                    attMethodId:true
                }
            });

            const createAttendance = await db.attendance.create({
                data: {
                    stdId: studentId,
                    studingTimeId: enrollmentInfo.studyTimeId,
                    attMethodId: attendanceMethod.attMethodId,
                    attTimestamp: dtNow,
                    attStatus: statusEnrollment(enrollmentInfo.timetable.timeStart, enrollmentInfo.timetable.timeLate, dtNow),
                    latitute: location.latitude,
                    longitute: location.longitude,
                    note: `ลงชื่อเข้าเรียนวิชา ${enrollmentInfo.timetable.subject.subNameThai} (${enrollmentInfo.timetable.subject.subNameEng})\nเวลา: ${dtNow.toFormat('yyyy-MM-dd HH:mm:ss')}`,
                    operatedBy: "Student",
                    tchId: enrollmentInfo.timetable.subject.teacher.tchId,
                    leaderId: null,
                }
            });
            res.status(200).json({message: 1});

        }catch(error) {
            console.error(error);
        };
    }else{
        return res.status(400).send({message:"bad requset"});
    }
}