import { daybetween } from '../helper/helper.js';
import db from '../prisma/client.js';
import { DateTime } from 'luxon';

const zone = process.env.TIME_ZONE || 'Asia/Bangkok';

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
    const { date } = req.query;
        
    try {
        let actParticipateFilter = {};
        
        // If date is provided in query, filter actParticipate by date
        if (date) {
            const filterDate = DateTime.fromISO(date);
            actParticipateFilter = {
                where: {
                    joinTimestamp: {
                        gte: filterDate.startOf('day').toUTC().toJSDate(),
                        lte: filterDate.endOf('day').toUTC().toJSDate()
                    }
                }
            };
        }
        
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
                    ...actParticipateFilter,
                    include: {
                        student: {
                            include: {
                                classroomMembers: {
                                    include: {
                                        classroom: true
                                    }
                                }
                            }
                        },
                        teacher: true
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
        return res.status(500).json({ error: "Failed to fetch activity data" });
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
                actDate: DateTime.fromISO(actDate).toUTC().toISO(),
                actDateEnd: DateTime.fromISO(actDateEnd).toUTC().toISO(),
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
    const { stdId, status, note, date } = req.body;
    try {
        const activity = await db.activity.findFirst({
            where: {
                actId: actId
            }
        });
        
        // Use the provided date or current date
        let targetDate = DateTime.now();
        if (date) {
            targetDate = DateTime.fromISO(date);
        }
        
        const activityPaticipate = await db.activityParticipate.findFirst({
            where: {
                actId: actId,
                stdId: stdId,
                joinTimestamp: {
                    gte: targetDate.startOf('day').toUTC().toJSDate(),
                    lte: targetDate.endOf('day').toUTC().toJSDate()
                }
            }
        });
       
        const activityParticipateCount = await db.activityParticipate.count({
            where: {
                actId: actId,
                joinTimestamp: {
                    gte: targetDate.startOf('day').toUTC().toJSDate(),
                    lte: targetDate.endOf('day').toUTC().toJSDate()
                }
            }
        });

        if (activityPaticipate) {
            if(status == "ABSENT"){
                await db.activityParticipate.delete({
                    where: {
                        actParticipateId: activityPaticipate.actParticipateId
                    }
                });
                return res.json({ message: 'success' });
            } else {
                // console.log(DateTime.now().toUTC().toJSDate());
                await db.activityParticipate.update({
                    where: {
                        actParticipateId: activityPaticipate.actParticipateId
                    },
                    data: {
                        note,
                    }
                });
                return res.json({ message: 'success' });
            }
        } else {
            if(activity.joinLimit && activity.joinLimitNumber > 0){
                //count activityparticipate
                const countActParticipate = await db.activityParticipate.count({
                    where: {
                        actId: actId,
                        joinTimestamp: {
                            gte: targetDate.startOf('day').toUTC().toJSDate(),
                            lte: targetDate.endOf('day').toUTC().toJSDate()
                        }
                    }
                });
                console.log(countActParticipate);
                if(countActParticipate >= activity.joinLimitNumber){
                    return res.status(400).json({ message: 'จำนวนนักเรียนเต็มแล้ว' });
                }
            }
            // Create with the target date instead of current date if date is provided
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
                    joinTimestamp: DateTime.now().toUTC().toJSDate()
                }
            });
            return res.json({ message: 'success' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    };
}

export const abstactActivityClassroom = async (req, res) => {
    const activityId = req.params.activityId;
    const classroomId = req.params.classId;
    if(!activityId && !classroomId) return res.status(401).json({message: "Something error on Client side"});
    if(classroomId === "all");
    const activities = await db.activity.findFirst({
        where:{
            actId: activityId
        }
    });
    const classroomMember = await db.classroomMember.findMany({
        where:{
            classId: classroomId
        },
        include:{
            student:true
        }
    });
    const actDateStart = DateTime.fromISO(activities.actDate.toISOString(), { zone : 'UTC' }).setZone('Asia/Bangkok');
    const actDateEnd = DateTime.fromISO(activities.actDateEnd.toISOString(), { zone: 'UTC'}).setZone('Asia/Bangkok');
    const dayBetween = daybetween(
        actDateStart.toString().split('T')[0], 
        actDateEnd.toString().split('T')[0]
    );
    const abstact = await dayBetween.reduce(async (accPromise, curr) => {
        const acc = await accPromise;
        const studentPaticipate = await Promise.all(classroomMember.map(async (member) => {
            const lteDate = DateTime.fromISO(`${curr}T${activities.actEndTime}:00Z`)
                                .setZone('UTC')
                                .minus({hour:7});
            const gteDate = DateTime.fromISO(`${curr}T${activities.actStartTime}:00Z`)
                                .setZone('UTC')
                                .minus({hour:7});
            const paticipate = await db.activityParticipate.findFirst({
                where:{
                    AND:{
                        stdId: member.stdId,
                        actId: activityId,
                        joinTimestamp:{
                            lte: lteDate,
                            gte: gteDate
                        }
                    }
                },
                include:{
                    student:true
                }
            });
            if(paticipate){
                return { ...paticipate, isJoin: true };
            }else{
                
            }
            return { stdId: member.stdId , student:{fName:member.student.fName,lName:member.student.lName,title:member.student.title} ,isJoin: false };
        }));
        acc[curr] = studentPaticipate.sort((a,b) => a.stdId.localeCompare(b.stdId));
        return acc;
    }, Promise.resolve({}));
    return res.status(200).json(abstact);
}

export const abstactActivityFilterByRoom = async(req, res) => {
    
    const activityId = req.params.activityId;
    try{
        const activitys = await db.activity.findFirst({
            where: {
                actId:activityId
            }
        });
    
        //หาว่ากิจกรรมที่ต้องการ insert นั้นอยู่ระหว่างช่วงเทอมไหน
        const dateTimeNow = DateTime.fromISO(activitys.actDate.toISOString()).setZone('Asia/Bangkok');
        const dateActivityStart = dateTimeNow.toString().split("T")[0];
        function isSchoolOpen(dateStr){
            const startDate = DateTime.fromJSDate(dateStr.termStart, {zone: 'UTC'}); // วันที่เริ่มเปิดเทอม
            const endDate = DateTime.fromJSDate(dateStr.termEnd, {zone: 'UTC'});   // วันที่ปิดเทอม
            const checkDate = DateTime.fromISO(dateActivityStart, {zone: 'UTC'});      // วันที่ที่ต้องการตรวจสอบ
            // console.log(startDate);
            if(checkDate >= startDate && checkDate <= endDate){
                return true;
            }else{
                return false;
            };
        }
    
        const termLists = await db.academicTerms.findMany({});
        let termId;
        for(const term of termLists) {
            if(isSchoolOpen(term)){
                termId = term.termId;
            }
        };
    
        // console.log(termId);
        ////////////////
        const actDateStart = DateTime.fromISO(activitys.actDate.toISOString(), { zone : 'UTC' }).setZone('Asia/Bangkok');
        const actDateEnd = DateTime.fromISO(activitys.actDateEnd.toISOString(), { zone: 'UTC'}).setZone('Asia/Bangkok');
        const paticipateCount = daybetween(
            actDateStart.toString().split('T')[0], 
            actDateEnd.toString().split('T')[0]
        ).length;
    
        const classroomsHasMembers = await db.classrooms.findMany({
            where:{
                termId: termId
            },
            include:{
                classroomMembers:{
                    include:{
                        student:true
                    }
                }
            },
            orderBy:[
                { classLevel : 'asc'},
                { classRoom: 'asc'}
            ]
        });
        
        const abstactFilterByClassroom = await  classroomsHasMembers.reduce(async (prev, curr) => {
            const acc = await prev;
            const participateMember = Promise.all(curr.classroomMembers.map(async (member) => {
                const participate = await db.activityParticipate.findMany({
                    where:{
                        AND:{
                            stdId:member.stdId,
                            actId:activitys.actId,
                            student:{
                                classroomMembers:{
                                    some:{
                                        classId: curr.classId
                                    }
                                }
                            }
                        }
                    },
                });
                const objectDraft = {
                    stdId: member.stdId,
                    title: member.student.title,
                    fName: member.student.fName,
                    lName: member.student.lName,
                    stdNo: parseInt(member.stdNo),
                    participateCount :participate.length
                }
                return objectDraft;
            }));
            const participateMemberSortByStdNo = (await participateMember).sort((a, b) => a.stdNo - b.stdNo);
            
            acc[`${curr.classLevel}/${curr.classRoom}`] =  participateMemberSortByStdNo;
            
            return acc;
        },Promise.resolve({}))
        return res.status(200).send(abstactFilterByClassroom);
    }catch(error){
        return res.status(501).send("message: something happening");
    }
    
}