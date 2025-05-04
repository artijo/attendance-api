import { daybetween } from '../helper/helper.js';
import db from '../prisma/client.js';
import { DateTime } from 'luxon';
import { pushMessageToLine } from '../helper/line.js';
import { generateToken, decodeToken, verifyToken } from '../helper/jwt.js';

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
        return res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
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
        return res.status(500).json({ message: 'Failed to fetch activity types', error: error.message });
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
        return res.status(500).json({ message: 'Failed to create activity', error: error.message });
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
        return res.status(500).json({ message: 'Failed to update activity', error: error.message });
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
        return res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
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
        const teacher = await db.teacher.findFirst({
            where: {
                tchId: req.user.id
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
       
        // const activityParticipateCount = await db.activityParticipate.count({
        //     where: {
        //         actId: actId,
        //         joinTimestamp: {
        //             gte: targetDate.startOf('day').toUTC().toJSDate(),
        //             lte: targetDate.endOf('day').toUTC().toJSDate()
        //         }
        //     }
        // });

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
                // console.log(countActParticipate);
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
            // Send LINE notification
            const parent = await db.studentParent.findMany({
                where: {
                    student: {
                        stdId: stdId
                    }
                },
                include: {
                    parent: true,
                    student: true
                }
            });
            if (parent.length > 0) {
                parent.map(async (p) => {
                    const message = `เรียนผู้ปกครอง ${p.parent.name} นักเรียน ${p.student.fName} ${p.student.lName} ได้เข้าร่วมกิจกรรม ${activity.actName} วันที่ ${DateTime.fromJSDate(activity.actDate).setZone(zone).toFormat('dd/LL/yyyy')}\n\n\nบันทึกการเข้าร่วมกิจกรรมโดยคุณครู ${teacher.fName} ${teacher.lName}`;
                    await pushMessageToLine(p.parent.lineId, message);
                });
            } else {
                console.log("No parent found for this student.");  
            }
        
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
    const actDateStart = DateTime.fromISO(activities.actDate.toISOString(), { zone : 'UTC' }).setZone(zone);
    const actDateEnd = DateTime.fromISO(activities.actDateEnd.toISOString(), { zone: 'UTC'}).setZone(zone);
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
        // console.log(activitys);
        //หาว่ากิจกรรมที่ต้องการ insert นั้นอยู่ระหว่างช่วงเทอมไหน
        const dateTimeNow = DateTime.fromISO(activitys.actDate.toISOString()).setZone(zone);
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
        // console.log(dateActivityStart);
    
        const termLists = await db.academicTerms.findMany({});
        let termId;
        for(const term of termLists) {
            if(isSchoolOpen(term)){
                termId = term.termId;
            }
        };
        // console.log(termId);
    
        const actDateStart = DateTime.fromISO(activitys.actDate.toISOString(), { zone : 'UTC' }).setZone(zone);
        const actDateEnd = DateTime.fromISO(activitys.actDateEnd.toISOString(), { zone: 'UTC'}).setZone(zone);
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

        // const classroom = await db.classrooms.findMany({
        //     where:{
        //         termId: termId
        //     },
        // });
        // console.log(termId);

        // console.log(classroomsHasMembers);
        
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
                // console.log(participate);
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
        return res.status(500).send("message: something happening");
    }
    
}

export const generateLinkActivityForQR = async (req, res) => {
    const { activityId } = req.body;
    if(activityId){
        try{
            //เวลาหมดอายุ Token เท่ากับวันที่สิ้นสุดกิจกรรม
            const activity = await db.activity.findFirst({
                where:{
                    actId: activityId
                }
            });
            if(!activity) return res.status(400).send({message:"activity not found"});
            const now = DateTime.now().setZone(zone);
            const activityDateEnd = DateTime.fromISO(activity.actDateEnd.toISOString(), { zone: 'UTC'}).setZone(zone).endOf('day');
           
            // เวลาหมดอายุ Token โดยเริมนับจากเวลาปัจจุบันถึงเวลาสิ้นสุดกิจกรรม
            const diff = activityDateEnd.diff(now, ['days', 'hours', 'minutes', 'seconds']);
            console.log(diff.toObject());
            
            // Calculate expiry time in seconds
            const expirySeconds = Math.floor((diff.toObject().days * 24 * 60 * 60) + 
                                          (diff.toObject().hours * 60 * 60) + 
                                          (diff.toObject().minutes * 60) + 
                                          (diff.toObject().seconds));
            
            const token = generateToken({
                activityId: activity.actId
            }, expirySeconds);
            const link = `${process.env.STUDENT_WEB_CLIENT}/activity/qr/${token}`;
            res.status(200).json({link});
        }catch(error) {
            console.error(error);
            return res.status(500).send("message: something happening");
        };
    }else{
        return res.status(400).send({message:"bad requset"});
    }
}

export const saveActivityByStudentWithQR = async (req, res) => {
    const { qrToken:token } = req.body;
    
    if(token){
        try{
            const verify = verifyToken(token);
            // console.log(verify);
            const activity = await db.activity.findFirst({
                where:{
                    actId: verify.activityId
                },
                include: {
                    classroom: {
                        include: {
                            classroom: true
                        }
                    }
                }
            });
            // ถ้าไม่อยู่ในวันที่และเวลาจัดกิจกรรมไม่สามารถเข้าร่วมได้
            const activityDate = DateTime.fromISO(activity.actDate.toISOString(), { zone : 'UTC' }).setZone(zone).startOf('day');
            const activityDateEnd = DateTime.fromISO(activity.actDateEnd.toISOString(), { zone: 'UTC'}).setZone(zone).endOf('day');
            // Check if current date is within activity date range
            // console.log(activityDate.toString(), activityDateEnd.toString());
            const now = DateTime.now().setZone(zone);
            // console.log(now.toString());
            if (now < activityDate || now > activityDateEnd) {
                return res.status(400).json({message:"activity is not in date"});
            }
            
            // Compare just the time portions
            const currentTime = now.toFormat('HH:mm');
            const startTime = activity.actStartTime;
            const endTime = activity.actEndTime;
            
            if(currentTime < startTime || currentTime > endTime){
                return res.status(400).json({message:"activity is not in time"});
            }
            // check activity is full
            if(activity.joinLimitNumber) {
                const count = await db.activityParticipate.count({
                    where:{
                        actId: activity.actId
                    }
                });
                if(count >= activity.joinLimitNumber){
                    return res.status(400).json({message:"activity is full"});
                }
            }
            // ตรวจสอบว่าเป็นนักเรียนในห้องเรียนที่สามารถเข้าร่วมกิจกรรมได้หรือไม่ถ้ามีการกำหนด
            if(activity.joinLimit){
                const classroom = await db.classroomCanjoinActivity.findMany({
                    where:{
                        activity:{
                            actId: activity.actId
                        },
                        classroom:{
                            classId: {
                                in: activity.classroom.map((classroom) => classroom.classId)
                            }
                        }
                    }
                });
                // console.log(classroom);
                // search for student in classroom
                if(classroom){
                    const student = await db.classroomMember.findFirst({
                        where:{
                            stdId: req.user.id,
                            classId: {
                                in: classroom.map((classroom) => classroom.classId)
                            }
                        }
                    });
                    if(!student){
                        return res.status(400).json({message:"you are not in classroom that can join this activity"});
                    }
                }
            }

            // check if student already joined the activity
            const activityParticipate = await db.activityParticipate.findFirst({
                where:{
                    AND:{
                        stdId: req.user.id,
                        actId: activity.actId
                    }
                }
            });
            if(activityParticipate){
                return res.status(200).json({message:"join activity success", activity, joinTimestamp: now.toJSDate()});
            }
            else{
                await db.activityParticipate.create({
                    data:{
                        actId:activity.actId,
                        stdId: req.user.id,
                        joinTimestamp:DateTime.fromISO(activity.actDate.toISOString(), { zone : 'UTC' }).setZone(zone),
                        operateBy:"student",
                    }
                });
                return res.status(200).json({message:"join activity success", activity, joinTimestamp: now.toJSDate()});
            }
        }catch(error) {
            console.error(error);
            return res.status(500).json({message:"something happening", error});
        };
    }else{
        return res.status(400).json({message:"bad requset"});
    }
}
