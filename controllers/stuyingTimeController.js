import db from '../prisma/client.js';
import { fecthHolidayDateTime } from '../helper/holidayApi.js';
import { formatTime } from '../helper/helper.js';
import { DateTime } from 'luxon';

export const getHoliday = async (req, res) => {
    try {
        const holiday = await fecthHolidayDateTime();
        res.json(holiday);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
}

export const createStuingCalendar = async (req, res) => {
    const { semester, termStart, termEnd, holiday } = req.body;
    try{
        const dateTimeStart = DateTime.fromISO(termStart, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z
        const dateTimeEnd = DateTime.fromISO(termEnd, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z

        const timetables = await db.timetable.findMany({
            where:{
                classroom:{
                    academicYear: parseInt(semester.split("|")[1]),
                    semester: parseInt(semester.split("|")[0])
                }
            },
            orderBy: [
                {dayOfWeek : 'asc'},
                {timeStart : 'asc'}
            ]
        });

         //if timetable is empty array
         if(!timetables.length > 0){
            console.log("No timetable found");
            // res.json({msg:"No timetable found"});
        }
        const calendar = []; //เก็บวันที่ที่เรียนตั้งแต่วันแรกจนถึงวันสุดท้าย
    
        const calendarHoliday = holiday.map((item) => { //เก็บวันหยุดราชการ
            const date = DateTime.fromISO(item["DTSTART;VALUE=DATE"], { zone: 'UTC' });
            return date.toString();
        });

        for (let month = dateTimeStart.month; month <= dateTimeEnd.month; month++) { // สร้างลูปเพื่อที่จะดันเวลาเข้าไปใน calendar
            const dayInMonth = DateTime.fromObject({ year: dateTimeStart.year, month }).daysInMonth;
            const startDay = month === dateTimeStart.month ? dateTimeStart.day : 1;
            const endDay = month === dateTimeEnd.month ? dateTimeEnd.day : dayInMonth;

            for (let day = startDay; day <= endDay; day++) {
                const date = DateTime.fromObject({ year: dateTimeStart.year, month, day }, { zone: 'UTC' });
                if (date.weekday !== 6 && date.weekday !== 7) {
                    calendar.push(date.toString());
                }
            }
        }

        const schoolCalendarDays = calendar.filter((item) => { //เอาแค่วันที่มีเรียน
            return !calendarHoliday.includes(item);
        });

        
        for(const timetable of timetables) {
            for(const day of schoolCalendarDays){
                const time = DateTime.fromISO(day, { zone: 'UTC' });
                const setTime = DateTime.fromObject(
                    { 
                        year: time.year, 
                        month: time.month, 
                        day: time.day, 
                        hour: formatTime(timetable.timeStart)[0], 
                        minute: formatTime(timetable.timeStart)[1], 
                        second: 0 }, { zone: 'UTC' }
                );
                if(time.weekday == timetable.dayOfWeek) {
                    const studingTime = await db.studingTime.create({
                        data:{
                            timetableId:timetable.timetableId,
                            studingTimeDate:setTime,
                        }
                    });
                }
            }
        }
        res.json({msg:"Create Studing Calendar Success"});
    }catch(err){
        console.error(err);
        res.json(err);
    }
}

export const createHoliday = async (req, res) => {
    const { holiday, semester } = req.body;
    try{
        const classrooms  = await db.classrooms.findMany({
            where:{
                academicYear: parseInt(semester.split("|")[1]),
                semester: parseInt(semester.split("|")[0])
            }
        });

        for(const classroom of classrooms) {
            for(const item of holiday){
                const holiday = await db.holiday.create({
                    data:{
                        holidayName:item.SUMMARY,
                        startHolidayDate:item["DTSTART;VALUE=DATE"], // YYYYMMDD
                        endHolidayDate:item["DTEND;VALUE=DATE"], // YYYYMMDD
                        howAddType:item.TYPE,
                        classId:classroom.classId
                    }
                });
            }
        }
        res.json({msg:"Create Holiday Success"});
    }catch(err){
        console.error(err);
        res.json(err);
    }
};

export const getStudyCalendar = async (req, res) => {
    const classroomId = req.query.classroomId
    try{
        const timetable = await db.timetable.findMany({
            where: {
                classId: classroomId
            }
        })

        let timetableId = timetable.map((item) => {
            return (
                item.timetableId
            )
        })

        const stuydingTime = await db.studingTime.findMany({
            where:{
                timetableId:{
                    in:timetableId
                }
            },
            select: {
                studyTimeId:true,
                studingTimeDate:true,
                timetable: {
                    select:{
                        subject:{
                            select:{
                                subCode: true
                            }
                        }
                    }
                }
            }
        })
        
        const newCalendar = stuydingTime.map((item) => {
            // console.log(item)
            // let sdate = DateTime.fromISO(item.startHolidayDate + "T00:00:00", { zone: 'UTC' });
            // let edate = DateTime.fromISO(item.endHolidayDate + "T23:59:59", { zone: 'UTC' });
            return {
                title:item.timetable.subject.subCode,
                date:item.studingTimeDate,
                color:"#708090",
            }
        });
        res.json(newCalendar);
    }catch(err){
        console.error(err);
        res.json(err);
    }
}


export const getHolidayCalendar = async (req, res) => {
    const classroomId = req.query.classroomId
    try{

        const colorOfType = {
            "ratchakhan":"#FF0000",
            "school":"#0000FF",
        };

        const holiday = await db.holiday.findMany({
            where: {
                classId: classroomId
            },
            orderBy: [
                {startHolidayDate : 'asc'},
                {endHolidayDate : 'asc'},
            ]
        });
    
        const newHoliday = holiday.map((item) => {
            let sdate = DateTime.fromISO(item.startHolidayDate + "T00:00:00", { zone: 'UTC' });
            let edate = DateTime.fromISO(item.endHolidayDate + "T23:59:59", { zone: 'UTC' });
            if(item.startHolidayDate === item.endHolidayDate){
                return {
                    title:item.holidayName,
                    start:sdate,
                    end:edate,
                    color:item.howAddType === "RATCHAKHAN" ? colorOfType.ratchakhan : colorOfType.school,
                }
            }else{
                return {
                    title:item.holidayName,
                    start:sdate,
                    end:edate,
                    color:item.howAddType === "RATCHAKHAN" ? colorOfType.ratchakhan : colorOfType.school,
                }
            }
            
        });
        res.json(newHoliday);
    }catch(err){
        console.error(err);
        res.json(err);
    }
}

export const getHolidayCalendarList = async (req, res) => {
    const body = req.body;
    const semester = body.semester;
    const academicYear = body.academicYear;
    function uniqueData(VALUE) {
        const uniqueData = [];
        if(VALUE) {
            const semesterMap = VALUE.map((items) => {
                return {holidayName: items.holidayName, sDate: items.startHolidayDate, eDate: items.endHolidayDate }
            });  
            for(const item of semesterMap) {
                let found = uniqueData.some(
                    (uniqueData) => {
                        uniqueData.holidayName === item.holidayName &&
                        uniqueData.startHolidayDate === item.startHolidayDate &&
                        uniqueData.endHolidayDate === item.endHolidayDate  
                    }
                );
                if (!found) {
                    uniqueData.push(item);
                }
            };
            return uniqueData;
        };
        return [];
    }
    if(body) {
        try{
            const classrooms = await db.classrooms.findMany({
                where:{
                    AND:{
                        semester:semester,
                        academicYear:academicYear
                    }
                },
                select:{
                    classId:true
                }
            })

            const holiday = await db.holiday.findMany({
                where:{
                    classId:{
                        in:[...classrooms.map(item => item.classId)]
                    }
                },
                orderBy: {
                    startHolidayDate:'asc'
                }
            })
            // console.log(uniqueData(holiday));
            res.json(uniqueData(holiday));
        }catch(err){
            console.error(err);
        };
    };
    
};

export const deleteHoliday = async (req, res) => {
    const { holidayName, sDate, eDate, semester, academicYear} = req.body;
    try{
        const classrooms  = await db.classrooms.findMany({
            where:{
                academicYear: parseInt(academicYear),
                semester: parseInt(semester),
            }
        });

        const holiday = await db.holiday.findMany({
            where:{
                AND:{
                        classId:{
                            in:[...classrooms.map(item => item.classId)]
                        },
                        holidayName:holidayName,
                        startHolidayDate:sDate,
                        endHolidayDate:eDate 
                } 
            }
        });

        for(const item of holiday){
            const deleteHoliday = await db.holiday.delete({
                where:{
                    holidayId:item.holidayId
                }
            });
        };
        res.status(200).json({msg:"Delete Holiday Success"});
    }catch(err){
        console.error(err);
        res.status(500).json(err);
    }
};

