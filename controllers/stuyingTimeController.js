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
    const { classroomId, termStart, termEnd, holiday } = req.body;
    try{
        const dateTimeStart = DateTime.fromISO(termStart, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z
        const dateTimeEnd = DateTime.fromISO(termEnd, { zone: 'UTC' }); //YYYY-MM-DD T HH:MM:SS Z
        const timetables = await db.timetable.findMany({
            where:{
                classId:classroomId
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

        const schoolCalendarDays = calendar.filter((item) => { //เอาวันที่ที่เรียนออกจากวันหยุด
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
                const studingTime = await db.studingTime.create({
                    data:{
                        timetableId:timetable.timetableId,
                        studingTimeDate:setTime,
                    }
                });
            }
        }
        res.json({msg:"Create Studing Calendar Success"});
    }catch(err){
        console.error(err);
        res.json(err);
    }
}




