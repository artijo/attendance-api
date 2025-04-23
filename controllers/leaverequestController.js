import db from '../prisma/client.js';
import { DateTime } from 'luxon';

export async function getAllLeaveRequestsByStudentId(req, res) {
    try {
        const leaveRequests = await db.leaveRequest.findMany({
            where: {
                stdId: req.user.id,
            },
            include: {
                leaveRequestType: true,
            }
        });
        return res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllLeaveRequestsType(req, res) {
    try {
        const leaveRequests = await db.leaveRequestType.findMany({
            include: {
                leaveRequest: true,
            }
        });
        return res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getStudingTimeByDate(req, res) {
    try {
        // get ClassroomId
        const classroomment = await db.classroomMember.findFirst({
            where: {
                stdId: req.user.id,
            },
            include: {
                classroom: true,
            }
        });
        if (!classroomment) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        const classroomId = classroomment.classroom.classId;
        const date = new Date(req.params.date);
        
        // Get day of week from the requested date (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7 if needed
        
        // console.log('classroomId', classroomId);
        // console.log('dayOfWeek', dayOfWeek);
        
        // Get timetable entries by classroomId and specific day of week
        const timetable = await db.timetable.findMany({
            where: {
                classId: classroomId,
                dayOfWeek: dayOfWeek
            }
        });
        
        if (!timetable || timetable.length === 0) {
            return res.status(404).json({ message: 'Timetable not found for this date' });
        }
        
        // Filter out any undefined IDs to prevent Prisma validation errors
        const timetableIds = timetable
            .filter(t => t && t.timetableId !== undefined)
            .map(t => t.timetableId);
            
        if (timetableIds.length === 0) {
            return res.status(404).json({ message: 'No valid timetable IDs found' });
        }
        
        // Create date range for the specific date
        const startDate = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endDate = new Date(new Date(date).setHours(23, 59, 59, 999));
        
        // Get StudingTime by timetableId and date - using the correct field name 'studingTimeDate' instead of 'date'
        const studingTime = await db.studingTime.findMany({
            where: {
                timetableId: {
                    in: timetableIds,
                },
                studingTimeDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                timetable: {
                    include: {
                        subject: true,
                        classroom: true,
                    },
                }
            }
        });

        // console.log('studingTime', studingTime);
        
        return res.json(studingTime || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function CreateLeaveRequest(req, res) {
    try {
        const data = req.body;
        const stdId = req.user.id; 

        console.log('leaveTypeId', data);

        // Create a new leave request
        const newLeaveRequest = await db.leaveRequest.create({
            data: {
                leaveRequestType: {
                    connect: { leaveTypeId: data.leaveTypeId },
                },
                student: {
                    connect: { stdId: stdId },
                },
                leaveDate: DateTime.fromJSDate(new Date(data.leaveDate)).toJSDate(),
                leaveReason: data.leaveReason,
            },
        });

        // Create studingTime records for each selected study time
        const studingTimeRecords = data.studyTimeIds.map((studingTimeId) => ({
            leaveId: newLeaveRequest.leaveId,
            studyTimeId: studingTimeId,
        }));
        await db.leaveRequestStudingTime.createMany({
            data: studingTimeRecords,
        });

        
        

        return res.status(201).json("Leave request created successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}