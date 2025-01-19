import db from '../prisma/client.js';
import { DateTime } from 'luxon';

export const getAllActivitiesByType = async (req, res) => {
    try {
        const { type } = req.params;
        let acttype = ''
        if (type === '1') {
            acttype = 'กิจกรรมต่อเนื่อง'
        } else if (type === '2') {
            acttype = 'กิจกรรมไม่ต่อเนื่อง'
        }
        const activities = await db.activityType.findMany({
            where: {
                actTypeName: acttype
            },
            include: {
                activity : {
                    include: {
                        teacher: true,
                    }
                }
            }
        });
        return res.json(activities)
    } catch (error) {
        console.error(error);
    };
}

export const getActivity = async (req, res) => {
    const uuid = req.params.uuid;
    try {
        const activity = await db.activity.findUnique({
            where: {
                actId: uuid
            },
            include: {
                activityType: true,
                teacher: {
                    include: {
                        teacher: true
                    }
                },
                actParticipate: {
                    include: {
                        student: true
                    }
                }
            }
        });
        return res.json(activity)
    } catch (error) {
        console.error(error);
    };
}

export const getActivityType = async (req, res) => {
    try {
        const activityType = await db.activityType.findMany();
        return res.json(activityType)
    } catch (error) {
        console.error(error);
    };
}

export const createActivity = async (req, res) => {
    const { actName, actDate, actEndTime, joinLimit, actStartTime, actLocation, actDesc, actTypeId, actDateEnd, teacher, actParticipate } = req.body;
    try {
        const activity = await db.activity.create({
            data: {
                actName,
                actDate: DateTime.fromISO(actDate).toJSDate(),
                actDateEnd: DateTime.fromISO(actDateEnd).toJSDate(),
                actStartTime,
                actEndTime,
                actLocation,
                actDesc,
                actTypeId,
                actStatus: "PROCESSING",
                joinLimit
            }
        });
        if (teacher) {
            teacher.map(async (tch) => {
                await db.activityTeacher.create({
                    data: {
                        activity: {
                            connect: {
                                actId: activity.actId
                            }
                        },
                        teacher : {
                            connect: {
                                tchId: tch.tchId
                            }
                        }
                    }
                });
            });
        }
        if (actParticipate) {
            actParticipate.map(async (paticipate) => {
                await db.classroomCanjoinActivity.create({
                    data: {
                        activity: {
                            connect: {
                                actId: activity.actId
                            }
                        },
                        classroom: {
                            connect: {
                                classId: paticipate.classId
                            }
                        }
                    }
                });
            });
        }
        return res.json(activity)
    } catch (error) {
        console.error(error);
    };
}