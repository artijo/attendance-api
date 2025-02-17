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
                        student: {
                            include: {
                                classroomMembers: {
                                    include: {
                                        classroom: true
                                    }
                                }

                            }
                        }
                    }
                },
                classroom: {
                    include: {
                        classroom: {
                            include: {
                                classroomMembers: {
                                    include: {
                                        student: true
                                    }
                                },
                                term: true
                            }
                        }
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
    const { actName, actDate, actEndTime, joinLimit, actStartTime, actLocation, actDesc, actTypeId, actDateEnd, teacher, actParticipate, joinLimitNumber } = req.body;
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
                joinLimit,
                joinLimitNumber: parseInt(joinLimitNumber)
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

export const editActivity = async (req, res) => {
    const uuid = req.params.uuid;
    const { actName, actDate, actEndTime, joinLimit, actStartTime, actLocation, actDesc, actTypeId, actDateEnd, teacher, actParticipate, joinLimitNumber } = req.body;
    try {
        const activity = await db.activity.update({
            where: {
                actId: uuid
            },
            data: {
                actName,
                actDate: DateTime.fromISO(actDate).toJSDate(),
                actDateEnd: DateTime.fromISO(actDateEnd).toJSDate(),
                actStartTime,
                actEndTime,
                actLocation,
                actDesc,
                actTypeId,
                joinLimit,
                joinLimitNumber: parseInt(joinLimitNumber)
            }
        });
        if (teacher) {
            await db.activityTeacher.deleteMany({
                where: {
                    actId: uuid
                }
            });
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
            await db.classroomCanjoinActivity.deleteMany({
                where: {
                    actId: uuid
                }
            });
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

export const getActivityByTeacher = async (req, res) => {
    try {
        const activity = await db.activityTeacher.findMany({
            where: {
                tchId: req.user.id
            },
            include: {
                activity: {
                    include: {
                        activityType: true,
                        teacher: true,
                        actParticipate: true,
                        classroom: {
                            include: {
                                classroom: {
                                    include: {
                                        term: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return res.json(activity)
    } catch (error) {
        console.error(error);
    };
}

export const paticipatedActivityByteacher = async (req, res) => {
    const { actId } = req.params;
    const { stdId, status, note } = req.body;
    try {
        const activityPaticipate = await db.activityParticipate.findFirst({
            where: {
                actId: actId,
                stdId: stdId,
                // ดึงข้อมูลที่เป็นวันปัจจุบัน
                joinTimestamp: {
                    gte: DateTime.now().startOf('day').toUTC().toJSDate(),
                    lte: DateTime.now().endOf('day').toUTC().toJSDate()
                }

            }
            }
        );
        if (activityPaticipate) {
            if(activityPaticipate.joinLimitNumber){
                //count activityparticipate
                const countActParticipate = await db.activityParticipate.count({
                    where: {
                        actId: actId
                    }
                });
                if(countActParticipate >= activityPaticipate.joinLimitNumber){
                    return res.status(400).json({ message: 'จำนวนนักเรียนเต็มแล้ว' });
                }
            }
            if(status == "ABSENT"){
                await db.activityParticipate.delete({
                    where: {
                        actParticipateId: activityPaticipate.actParticipateId
                    }
                });
                return res.json({ message: 'success' });
            }else {
            await db.activityParticipate.update({
                where: {
                    actParticipateId: activityPaticipate.actParticipateId
                },
                data: {
                    note
                }
            });
            return res.json({ message: 'success' });
        }
        } else {
            await db.activityParticipate.create({
                data: {
                    activity: {
                        connect: {
                            actId: actId
                        }
                    },
                    student: {
                        connect: {
                            stdId: stdId
                        }
                    },
                    note: note,
                    operateBy: "TEACHER",
                    teacher: {
                        connect: {
                            tchId: req.user.id
                        }
                    },
                    joinTimestamp: DateTime.now().toUTC().toJSDate(),
                }
            });
            return res.json({ message: 'success' });
        }

    }catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        };

}