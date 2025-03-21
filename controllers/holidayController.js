import { DateTime } from 'luxon';
import { fecthHolidayDateTime } from '../helper/holidayApi.js';
import db from '../prisma/client.js';

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
        const fullCalendarHoliday = holiday.map((holiday) => ({
            title: holiday.holidayName,
            start: holiday.startHolidayDate,
            end: holiday.endHolidayDate,
            allDay: true,
            color: holiday.type === 'RATCHAKHAN' ? 'red' : 'blue'
        }));
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
                    termId: req.params.termId
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
    const holidaydateChangeTimezone = DateTime.fromISO(`${body.startHolidayDate}T00:00:00`).setZone('Asia/Bangkok');
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
    if (body) {
        try {
            for(const holiday of body.holidayList){
                const startDate = DateTime.fromISO(holiday.startDate+"T00:00:00").setZone('Asia/Bangkok');
                const endDate = DateTime.fromISO(holiday.endDate+"T00:00:00").setZone('Asia/Bangkok');
                await db.holiday.create({
                    data:{
                        holidayName:holiday.holidayname,
                        startHolidayDate:startDate,
                        endHolidayDate:endDate,
                        type:holiday.type,
                        term:{
                            connect:{
                                termId:body.termId
                            }
                        }
                    }
                })
            }
            res.status(200).json({message: "สร้างรายการวันหยุดสำเร็จ"});
        } catch (err) {
            // console.error(err);
            res.status(500).json(err);
        };
    }else{
        res.status(400).json({message: "กรุณากรอกข้อมูลให้ครบถ้วน"})
    }
};
