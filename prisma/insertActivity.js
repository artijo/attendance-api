import { DateTime } from 'luxon';
import db from './client.js';

async function insertActivity() {

    function getDatesInRange(startDate, endDate) {
        let date = startDate;
        const dates = [];
        while (date <= endDate) {
            dates.push(date.toISODate());
            date = date.plus({ days: 1 });
        }
        // console.log(dates);
        return dates;
    }
    const termId = "term-2025-1";
    const activityId = "6dc73dd4-7def-41d1-8a10-f2e53cc51d63";
    const activity = await db.activity.findUnique({
        where:{
            actId:activityId
        }
    });
    const actStart = DateTime.fromJSDate(activity.actDate).setZone('Asia/Bangkok');
    const actEnd = DateTime.fromJSDate(activity.actDateEnd).setZone('Asia/Bangkok');
    const dates = getDatesInRange(actStart, actEnd);
    const classrooms = await db.classrooms.findMany({
        where:{
            termId:termId
        },
        include:{
            classroomMembers:true,
            teacher:true
        }
    });
    classrooms.forEach((classroom) => {
        const teacherId = classroom.teacher[0].tchId;
        (classroom.classroomMembers.forEach(async (classroomMember) => { 
            dates.forEach(async (date) => {
                const dtDate = DateTime.fromISO(`${date}T${activity.actStartTime}:00`);
                await db.activityParticipate.create({
                    data:{
                        actId:activityId,
                        stdId:classroomMember.stdId,
                        note:"",
                        joinTimestamp:dtDate,
                        operateBy:"student",
                        teacherId:teacherId,
                    }
                });
            })
            
        }));
    })
};
insertActivity();