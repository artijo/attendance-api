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
            res.json(holiday);
        } catch (err) {
            console.error(err);
            res.json(err);
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
            res.json(holiday);
        } catch (err) {
            console.error(err);
            res.json(err);
        };
    };
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
    if (body) {
        try {
            const holiday = await db.holiday.update({
                where: {
                    holidayId: holidayId
                },
                data: {
                    holidayName: body.holidayName,
                    startHolidayDate: body.startHolidayDate,
                    endHolidayDate: body.startHolidayDate,
                    type: body.type
                }
            });
            res.json(holiday);
        } catch (err) {
            console.error(err);
            res.json(err);
        };
    };
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
                const startDate = DateTime.fromISO(holiday.startDate+"T00:00:00Z", { zone: 'UTC' });
                const endDate = DateTime.fromISO(holiday.endDate+"T00:00:00Z", { zone: 'UTC' });
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
            res.json({msg: "Create Holiday Success"});
        } catch (err) {
            console.error(err);
            res.json(err);
        };
    };
};
