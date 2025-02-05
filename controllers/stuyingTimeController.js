import db from '../prisma/client.js';
import { formatTime, formatDateYYYYMMDD, daybetween } from '../helper/helper.js';
import { DateTime } from 'luxon';


export const createStudingTime = async (req, res) => {
    const body = req.body;
    const termId = body.termId;
    const holidayList = body.holidayList.map((holiday) => holiday.startDate);
    const classroomids = body.classroomids;
    // console.log(classroomids);
    // console.log(termId);
    // Ex..term-2024-1
    // console.log(holidayList);
    // Ex..{
    //     id: '0c662b75-32c5-4eb4-a5f3-fd161cc6b9d9',
    //     holidayname: 'วันขึ้นปีใหม่',
    //     startDate: '2025-01-01',
    //     endDate: '2025-01-01',
    //     type: 'RATCHAKHAN'
    // } => ['2025-01-01']
    try{
        const academicYearTerm = await db.academicTerms.findUnique({
            where: {
                termId: termId
            },
        });
      
        const timetables = await db.timetable.findMany({
            where: {
                classId: {
                    in: [...classroomids]
                }
            },
            orderBy: [
                {classId : 'asc'},
                {dayOfWeek : 'asc'},
                {timeStart : 'asc'}
            ],
            select: {
                timetableId: true,
                dayOfWeek:true,
                timeStart:true,
            }
        });
        const dateTimeStart = academicYearTerm.termStart.toISOString().split("T")[0]; //ex. ['2025-05-15','00:00:00.000Z']
        const dateTimeEnd = academicYearTerm.termEnd.toISOString().split("T")[0]; //ex. ['2025-09-09','00:00:00.000Z']
        const datebetween = daybetween(dateTimeStart, dateTimeEnd).filter((date) => {
            const weekday = DateTime.fromISO(`${date}`, { zone: 'UTC' }).weekday; // filter เพื่อตัดวันที่เป้นเสาร์ อาทิตย์ออก
            return weekday !== 6 && weekday !== 7;
        }).filter((date) => !holidayList.includes(date)); // filter เพื่อตัดวันที่เป็นวันหยุดออก

        for(const timetable of timetables) {
            for(const date of datebetween) {
                const weekdayDate = DateTime.fromISO(`${date}T00:00:00Z`, { zone: 'UTC' }).weekday;
                if(timetable.dayOfWeek === weekdayDate){
                    await db.studingTime.create({
                        data: {
                            timetableId: timetable.timetableId,
                            studingTimeDate: DateTime.fromISO(`${date}T${timetable.timeStart}Z`, { zone: 'UTC' })
                        }
                    });
                };
            }
        }
        res.status(200).json({message:"สร้างปฎิทินการเรียนแล้วเรียบร้อย"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"เกิดข้อผิดพลาดในการสร้างปฎิทินการเรียน"});
    };
};

export const getFullCalendarStudyTime = async (req, res) => {
    const classroomId = req.params.classroomId;
    try{
        const timetables = await db.timetable.findMany({
            where: {
                classId: classroomId
            },
            select:{
                timetableId: true,
            }
        })
        //console.log(timetables);  // Ex. [{ timetableId: 'd4639e55-00f8-4e6f-8a8c-2256c2e045db' }, ...]
        const studyTimes = await db.studingTime.findMany({
            where: {
                timetableId: {
                    in: timetables.map((timetable) => timetable.timetableId)
                }
            },
            orderBy: {
                studingTimeDate: 'asc'
            },
            select:{
                timetable:{
                    select:{
                        subject: {
                            select: {
                                subCode: true,
                                subNameThai: true,
                                subNameEng: true
                            }
                        },
                    }
                },
                studingTimeDate: true
            }
        });
        const fullCalendarEventFormat = studyTimes.map((studytime) => {
            const startDateTime = DateTime.fromISO(studytime.studingTimeDate.toISOString(), { zone: 'UTC' });
            const endDateTime = startDateTime.plus({ minutes: 50 });
            return {
                title: `${studytime.timetable.subject.subCode}-${studytime.timetable.subject.subNameThai}`,
                start: startDateTime.toISO(),
                end: endDateTime.toISO(),
                color: "#FFD700"
            };
        });
        // console.log(fullCalendarEventFormat);
        res.json(fullCalendarEventFormat);
    }catch(err){
        console.error(err);
    }
};

export const deleteStudingTime = async (req, res) => {
    const classroomId = req.params.classroomId;
    if(classroomId){
        try{
            const timetables = await db.timetable.findMany({
                where: {
                    classId: classroomId
                },
                select: {
                    timetableId: true
                }
            });
            const timetableId = timetables.map((timetable) => timetable.timetableId);
            const studingTimeIds = await db.studingTime.findMany({
                where: {
                    timetableId: {
                        in: [...timetableId]
                    }
                },
                select: {
                    studyTimeId: true
                }
            });

            await db.attendance.deleteMany({
                where: {
                    studingTimeId: {
                        in: [...studingTimeIds.map((studingTime) => studingTime.studyTimeId)]
                    }
                }
            });


            await db.studingTime.deleteMany({
                where: {
                    // timetableId: {
                    //     in: [...timetableId]
                    // }
                    studyTimeId:{
                        in: [...studingTimeIds.map((studingTime) => studingTime.studyTimeId)]
                    }
                }
            });
            res.json({msg:"Delete Studing Calendar Success"});
        }catch(err){
            console.error(err);
        };
    };
};

export const getStuydingTimeById = async (req, res) => {
    const studingTimeId = req.params.UUID;
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

                        }
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
    };

};


// export const createStuingCalendar = async (req, res) => {
//     const { semester, termStart, termEnd, holiday } = req.body;
//     try{
//         const dateTimeStart = DateTime.fromISO(termStart, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z
//         const dateTimeEnd = DateTime.fromISO(termEnd, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z

//         const timetables = await db.timetable.findMany({
//             where:{
//                 classroom:{
//                     academicYear: parseInt(semester.split("|")[1]),
//                     semester: parseInt(semester.split("|")[0])
//                 }
//             },
//             orderBy: [
//                 {dayOfWeek : 'asc'},
//                 {timeStart : 'asc'}
//             ]
//         });

//          //if timetable is empty array
//          if(!timetables.length > 0){
//             console.log("No timetable found");
//             // res.json({msg:"No timetable found"});
//         }
//         const calendar = []; //เก็บวันที่ที่เรียนตั้งแต่วันแรกจนถึงวันสุดท้าย
    
//         const calendarHoliday = holiday.map((item) => { //เก็บวันหยุดราชการ
//             const date = DateTime.fromISO(item["DTSTART;VALUE=DATE"], { zone: 'UTC' });
//             return date.toString();
//         });

//         for (let month = dateTimeStart.month; month <= dateTimeEnd.month; month++) { // สร้างลูปเพื่อที่จะดันเวลาเข้าไปใน calendar
//             const dayInMonth = DateTime.fromObject({ year: dateTimeStart.year, month }).daysInMonth;
//             const startDay = month === dateTimeStart.month ? dateTimeStart.day : 1;
//             const endDay = month === dateTimeEnd.month ? dateTimeEnd.day : dayInMonth;

//             for (let day = startDay; day <= endDay; day++) {
//                 const date = DateTime.fromObject({ year: dateTimeStart.year, month, day }, { zone: 'UTC' });
//                 if (date.weekday !== 6 && date.weekday !== 7) {
//                     calendar.push(date.toString());
//                 }
//             }
//         }

//         const schoolCalendarDays = calendar.filter((item) => { //เอาแค่วันที่มีเรียน
//             return !calendarHoliday.includes(item);
//         });

        
//         for(const timetable of timetables) {
//             for(const day of schoolCalendarDays){
//                 const time = DateTime.fromISO(day, { zone: 'UTC' });
//                 const setTime = DateTime.fromObject(
//                     { 
//                         year: time.year, 
//                         month: time.month, 
//                         day: time.day, 
//                         hour: formatTime(timetable.timeStart)[0], 
//                         minute: formatTime(timetable.timeStart)[1], 
//                         second: 0 }, { zone: 'UTC' }
//                 );
//                 if(time.weekday == timetable.dayOfWeek) {
//                     const studingTime = await db.studingTime.create({
//                         data:{
//                             timetableId:timetable.timetableId,
//                             studingTimeDate:setTime,
//                         }
//                     });
//                 }
//             }
//         }
//         res.json({msg:"Create Studing Calendar Success"});
//     }catch(err){
//         console.error(err);
//         res.json(err);
//     }
// }

// export const deleteStudingTime = async (req, res) => {
//     const { semester, academicYear, date} = req.body;

//     const dateUTC = DateTime.fromISO(date, { zone: 'UTC' })
//     //date format YYYY-MM-DD
//     try{
//         const classrooms  = await db.classrooms.findMany({
//             where:{
//                 academicYear: parseInt(academicYear),
//                 semester: parseInt(semester),
//             }
//         });

//         const timetable = await db.timetable.findMany({
//             where: {
//                 AND: {
//                     classId: {
//                         in: [...classrooms.map(item => item.classId)]
//                     },
//                     dayOfWeek: dateUTC.weekday
//                 }
//             }
//         })
//         const timetableId = timetable.map((item) => {
//             return (
//                 item.timetableId
//             )
//         })

//         const studingTime = await db.studingTime.findMany({
//             where: {
//                 timetableId: {
//                     in: timetableId
//                 }
//             }
//         })

//         const studyTimeId = studingTime.filter((item) => {
//             const itemUTC = DateTime.fromISO(item.studingTimeDate.toISOString(), { zone: 'UTC' });     
//             return itemUTC.dayOfWeek === dateUTC.weekday, itemUTC.year === dateUTC.year, itemUTC.month === dateUTC.month, itemUTC.day === dateUTC.day
//         }).map((item) => {
//             return (
//                 item.studyTimeId
//             )
//         })
//         const deleteStudingTime = await db.studingTime.deleteMany({
//             where: {
//                 studyTimeId: {
//                     in: studyTimeId
//                 }
//             }
//         });
//         res.json({msg:"Delete Studing Time Success"});
//     }catch(err){
//         console.error(err);
//         res.json(err);
//     }
// }

// export const createHoliday = async (req, res) => {
//     const { holiday, semester } = req.body;
//     try{
//         const classrooms  = await db.classrooms.findMany({
//             where:{
//                 academicYear: parseInt(semester.split("|")[1]),
//                 semester: parseInt(semester.split("|")[0])
//             }
//         });

//         for(const classroom of classrooms) {
//             for(const item of holiday){
//                 const holiday = await db.holiday.create({
//                     data:{
//                         holidayName:item.SUMMARY,
//                         startHolidayDate:item["DTSTART;VALUE=DATE"], // YYYYMMDD
//                         endHolidayDate:item["DTEND;VALUE=DATE"], // YYYYMMDD
//                         howAddType:item.TYPE,
//                         classId:classroom.classId
//                     }
//                 });
//             }
//         }
//         res.json({msg:"Create Holiday Success"});
//     }catch(err){
//         console.error(err);
//         res.json(err);
//     }
// };

// export const getStudyCalendar = async (req, res) => {
//     const classroomId = req.query.classroomId
//     try{
//         const timetable = await db.timetable.findMany({
//             where: {
//                 classId: classroomId
//             }
//         })

//         let timetableId = timetable.map((item) => {
//             return (
//                 item.timetableId
//             )
//         })

//         const stuydingTime = await db.studingTime.findMany({
//             where:{
//                 timetableId:{
//                     in:timetableId
//                 }
//             },
//             select: {
//                 studyTimeId:true,
//                 studingTimeDate:true,
//                 timetable: {
//                     select:{
//                         subject:{
//                             select:{
//                                 subCode: true,
//                                 subNameEng: true,
//                                 subNameThai: true
//                             }
//                         },
//                         classId:true,
//                         timeStart:true,
//                         timeEnd:true, 
//                     }
//                 }
//             }
//         })
        
//         const newCalendar = stuydingTime.map((item) => {
//             let sdate = DateTime.fromISO(item.studingTimeDate.toISOString(), { zone: 'UTC' });
//             let edateString = `${item.studingTimeDate.year}-${item.studingTimeDate.month}-${item.studingTimeDate.day}T${item.timetable.timeEnd} `;
//             let edate = DateTime.fromISO(edateString, { zone: 'UTC' });
//             return {
//                 title:`${item.timetable.subject.subNameThai}`,
//                 start:sdate.toString(),
//                 end:edate.toString(),
//                 color:"#aec6cf ",
//             }
//         });
//         res.json(newCalendar);
//     }catch(err){
//         console.error(err);
//         res.json(err);
//     }
// }

// const colorOfType = {
//     "ratchakhan":"#FF0000",
//     "school":"#0000FF",
// };

// export const getHolidayCalendar = async (req, res) => {
//     const classroomId = req.query.classroomId
//     try{
//         const holiday = await db.holiday.findMany({
//             where: {
//                 classId: classroomId
//             },
//             orderBy: [
//                 {startHolidayDate : 'asc'},
//                 {endHolidayDate : 'asc'},
//             ]
//         });
    
//         const newHoliday = holiday.map((item) => {
//             let sdate = DateTime.fromISO(item.startHolidayDate + "T00:00:00Z", { zone: 'UTC' });
//             let edate = DateTime.fromISO(item.endHolidayDate + "T23:59:59Z", { zone: 'UTC' });
//             return {
//                 title:item.holidayName,
//                 start:sdate,
//                 end:edate,
//                 color:item.howAddType === "RATCHAKHAN" ? colorOfType.ratchakhan : colorOfType.school,
//             }
//         });
//         res.json(newHoliday);
//     }catch(err){
//         console.error(err);
//         res.json(err);
//     }
// }

// export const getHolidayCalendarList = async (req, res) => {
//     const body = req.body;
//     const semester = body.semester;
//     const academicYear = body.academicYear;
//     function uniqueData(VALUE) {
//         const uniqueData = [];
//         if(VALUE) {
//             const semesterMap = VALUE.map((items) => {
//                 // console.log(items.startHolidayDate);
//                 return {holidayName: items.holidayName, sDate: items.startHolidayDate, eDate: items.endHolidayDate, howAddType: items.howAddType, color:items.howAddType === "RATCHAKHAN" ? colorOfType.ratchakhan : colorOfType.school}
//             });  
//             for(const item of semesterMap) {
//                 let found = uniqueData.some(
//                     (uniqueData) => {
//                         uniqueData.holidayName === item.holidayName &&
//                         uniqueData.startHolidayDate === item.startHolidayDate &&
//                         uniqueData.endHolidayDate === item.endHolidayDate  
//                     }
//                 );
//                 if (!found) {
//                     uniqueData.push(item);
//                 }
//             };
//             return uniqueData;
//         };
//         return [];
//     }
//     if(body) {
//         try{
//             const classrooms = await db.classrooms.findMany({
//                 where:{
//                     AND:{
//                         semester:semester,
//                         academicYear:academicYear
//                     }
//                 },
//                 select:{
//                     classId:true
//                 }
//             })

//             const holiday = await db.holiday.findMany({
//                 where:{
//                     classId:{
//                         in:[...classrooms.map(item => item.classId)]
//                     }
//                 },
//                 orderBy: {
//                     startHolidayDate:'asc'
//                 }
//             })

//             res.json(uniqueData(holiday));
//         }catch(err){
//             console.error(err);
//         };
//     };
// };
// async function createStudingTime(classroomIdArray, date) {
//     const betweenDate = [];
//     const startDate = DateTime.fromISO(date, { zone: 'UTC' });
//     const weekday = startDate.weekday;
    
//     const timetable = await db.timetable.findMany({
//         where: {
//             AND:{
//                 classId:{
//                     in:classroomIdArray
//                 },
//                 dayOfWeek: weekday
//             }
//         }
//     });
    
//     if(timetable.length > 0) {
//         for(const item of timetable) {
//             const time = DateTime.fromISO(date, { zone: 'UTC' });
//             const setTime = DateTime.fromObject(
//                 { 
//                     year: time.year, 
//                     month: time.month, 
//                     day: time.day, 
//                     hour: formatTime(item.timeStart)[0], 
//                     minute: formatTime(item.timeStart)[1], 
//                     second: 0 }, { zone: 'UTC' }
//             );
//             const studingTime = await db.studingTime.create({
//                 data:{
//                     timetableId:item.timetableId,
//                     studingTimeDate:setTime,
//                 }
//             });
//         }
//     }else{
//         console.log("No timetable found");
//     }
// }

// export const deleteHoliday = async (req, res) => {
//     const { holidayName, sDate, eDate, semester, academicYear} = req.body;
//     try{

//         const classrooms  = await db.classrooms.findMany({
//             where:{
//                 academicYear: parseInt(academicYear),
//                 semester: parseInt(semester),
//             }
//         });

//         const holiday = await db.holiday.findMany({
//             where:{
//                 AND:{
//                         classId:{
//                             in:[...classrooms.map(item => item.classId)]
//                         },
//                         holidayName:holidayName,
//                         startHolidayDate:sDate,
//                         endHolidayDate:eDate 
//                 } 
//             }
//         });
//         for(const item of holiday){
//             const deleteHoliday = await db.holiday.delete({
//                 where:{
//                     holidayId:item.holidayId
//                 }
//             });
//         };
//         createStudingTime(classrooms.map(item => item.classId), sDate);
//         res.status(200).json({msg:"Delete Holiday Success"});
//     }catch(err){
//         console.error(err);
//         res.status(500).json(err);
//     }
// };

// export const updateHoliday = async (req, res) => {
//     const { newData, oldData, semesterAndAcademicYear} = req.body;
//     try{
//         const classrooms  = await db.classrooms.findMany({
//             where:{
//                 academicYear: parseInt(semesterAndAcademicYear.academicYear),
//                 semester: parseInt(semesterAndAcademicYear.semester),
//             }
//         });

//         const holiday = await db.holiday.findMany({
//             where:{
//                 AND:{
//                         classId:{
//                             in:[...classrooms.map(item => item.classId)]
//                         },
//                         holidayName:oldData.holidayName,
//                         startHolidayDate:oldData.sDate,
//                         endHolidayDate:oldData.eDate 
//                 } 
//             }
//         });
        
//         for(const item of holiday){
//             const updateHoliday = await db.holiday.update({
//                 where:{
//                     holidayId:item.holidayId
//                 },
//                 data:{
//                     holidayName:newData.holidayName,
//                     startHolidayDate:oldData.sDate,
//                     endHolidayDate:oldData.eDate 
//                 }
//             });
//         };
//         res.status(200).json({msg:"Update Holiday Success"});
//     }catch(err){
//         console.error(err);
//         res.status(500).json(err);
//     }
// };

