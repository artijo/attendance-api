import { DateTime } from 'luxon';
import { fecthHolidayDateTime } from '../helper/holidayApi.js';
import db from '../prisma/client.js';

const zone = process.env.TIME_ZONE || 'Asia/Bangkok';

export const fullCalendarHoliday = async (req, res) => {
    const classroomId = req.params.classroomId;
    try {
        const classroom = await db.classrooms.findUnique({
            where: {
                classId: classroomId
            },
            select: {
                termId: true
            }
        });
        const holiday = await db.holiday.findMany({
            where: {
                termId: classroom.termId
            },
            orderBy:[
                {
                    startHolidayDate:'asc'
                }
            ]
        });
        const fullCalendarHoliday = holiday.map((holiday) => {
            const startHolidayDateFormat = DateTime.fromJSDate(holiday.startHolidayDate).setZone(zone);
            const endHolidayDateFormat = DateTime.fromJSDate(holiday.endHolidayDate).setZone(zone);
            // console.log(startHolidayDateFormat);
            // console.log(endHolidayDateFormat);
            const object = {
                title: holiday.holidayName,
                start: startHolidayDateFormat,
                end: endHolidayDateFormat,
                allDay: true,
                holidayType: holiday.type
                // color: holiday.type === 'RATCHAKHAN' ? 'red' : 'blue'
            }
            return object;
        });
        res.json(fullCalendarHoliday);
    }catch(err){
        console.error(err);
    }
};

export const getHolidayList = async (req, res) => {
    const termId = req.params.termId;   
    if (termId) {
        try {
            const holiday = await db.holiday.findMany({
                where: {
                    termId: termId
                },
                orderBy:[
                    {
                        startHolidayDate:'asc'
                    }
                ]
            });
            res.status(200).json(holiday);
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        };
    };
};

export const deleteHoliday = async (req, res) => {
    const holidayId = req.params.holidayId;
    if (holidayId) {
        try {
            const holiday = await db.holiday.delete({
                where: {
                    holidayId: holidayId
                }
            });
            res.status(200).json({message: `ลบ ${holiday.holidayName} สำเร็จ`});
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        };
    }else{
        res.status(400).json({message:"ไม่มีวันหยุดนี้อยู่ในระบบ"})
    }
};

export const getOneHoliday = async (req, res) => {
    const holidayId = req.params.holidayId;
    if (holidayId) {
        try {
            const holiday = await db.holiday.findUnique({
                where: {
                    holidayId: holidayId
                }
            });
            // console.log(holiday);
            res.json(holiday);
        } catch (err) {
            console.error(err);
            res.json(err);
        };
    };
};

export const updateHoliday = async (req, res) => {
    const holidayId = req.params.holidayId;
    const body = req.body;
    const holidaydateChangeTimezone = DateTime.fromISO(`${body.startHolidayDate}T00:00:00`).setZone(zone);
    if (body) {
        try {
            const holiday = await db.holiday.update({
                where: {
                    holidayId: holidayId
                },
                data: {
                    holidayName: body.holidayName,
                    startHolidayDate: holidaydateChangeTimezone,
                    endHolidayDate: holidaydateChangeTimezone,
                    type: body.type
                }
            });
            res.status(200).json({message: `แก้ไขวันหยุดสำเร็จ`});
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        };
    }else{
        res.status(400).json({message: "กรุณาใส่ข้อมูลให้ครบถ้วน"})
    }
};

export const getHolidayListAuto = async (req, res) => {
    try {
        const holiday = await fecthHolidayDateTime();
        res.json(holiday);
    } catch (err) {
        console.error(err);
        res.json(err);
    };
};

export const createHoliday = async (req, res) => {
    const body = req.body;
    const termId = body.termId;
    const holidayList = body.holidayList;
    if (body) {
        try {
            // console.log(holidayList);
            const studyTime = await db.studingTime.findMany({
                where:{
                    timetable:{
                        classroom:{
                            termId:termId
                        }
                    }
                },
                include: {
                    attendance:true
                }
            });

            const getStudyTimeHaveAttendence = studyTime.map((studytime) => {
                const studytimedate = DateTime.fromJSDate(studytime.studingTimeDate).setZone(zone).toFormat('yyyy-MM-dd');
                if(studytime.attendance.length > 0){
                    return studytimedate
                }else{
                    return;
                }
            });

            // console.log(getStudyTimeHaveAttendence);

            const holidayDateList = holidayList.filter((holiday) => {
                const date = DateTime.fromISO(holiday.startDate+"T00:00:00").setZone(zone).toFormat('yyyy-MM-dd');
                return !getStudyTimeHaveAttendence.includes(date);
            });

            if(holidayDateList.length > 0) {
                const datetimeholidayDatelist =holidayDateList.map((datelist) => {
                    const dateObject = {
                        dateStart: DateTime.fromISO(datelist.startDate+"T00:00:00").setZone(zone),
                        dateEnd: DateTime.fromISO(datelist.endDate+"T23:59:00").setZone(zone)
                    }
                    return dateObject;
                });
                for(const date of datetimeholidayDatelist){
                    const studingTime = await db.studingTime.findMany({
                        where:{
                            studingTimeDate:{
                                gte:new Date(date.dateStart),
                                lte:new Date(date.dateEnd),
                            }
                        }
                    });
                    if(studingTime.length > 0){
                        for(const studytime of studingTime){
                            const deleteStudytime = await db.studingTime.delete({
                                where:{
                                    studyTimeId:studytime.studyTimeId
                                }
                            });
                        };
                    }
                };
                for (const holiday of holidayDateList) {
                    const startDate = DateTime.fromISO(holiday.startDate + "T00:00:00").setZone(zone);
                    const endDate = DateTime.fromISO(holiday.endDate + "T00:00:00").setZone(zone);
                    const createholiday = await db.holiday.create({
                        data: {
                            holidayName: holiday.holidayname,
                            startHolidayDate: startDate,
                            endHolidayDate: endDate,
                            type: holiday.type,
                            term: {
                                connect: {
                                    termId: termId
                                }
                            }
                        }
                    });
                }
                res.status(200).json({message: "สร้างรายการวันหยุดสำเร็จ"});
            }else{
                return res.status(400).send({message:"ไม่สามารถสร้างวันหยุดได้เนื่องจากมีวันหยุดบางอันตรงกับวันที่เรียนและวันที่เรียนมีการเช็คชื่่อเข้าเรียนแล้ว"})
            }
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        };
    }else{
        res.status(400).json({message: "กรุณากรอกข้อมูลให้ครบถ้วน"})
    }
};
