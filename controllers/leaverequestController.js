import db from '../prisma/client.js';
import { DateTime } from 'luxon';
import { uploadFileToS3, generateSignedUrl } from '../libs/r2.js';

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
        console.log('file', req.file);

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

        // Upload file to S3 if provided
        if (req.file) {
            const {fileName} = await uploadFileToS3(req.file, "nps"); 
            console.log('fileName', fileName);
            await db.leaveRequest.update({
                where: { leaveId: newLeaveRequest.leaveId },
                data: { LeaveFile: fileName },
            });
        }
        

        return res.status(201).json("Leave request created successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getLeaveRequestById(req, res) {
    try {
        const leaveRequestId = req.params.id;
        let leaveRequest = await db.leaveRequest.findUnique({
            where: {
                leaveId: leaveRequestId,
            },
            include: {
                leaveRequestType: true,
                student: true,
                studingTime: {
                    include: {
                        teacherApprove: true,
                        studingTime: {
                            include: {
                                timetable: {
                                    include: {
                                        subject:{
                                            include: {
                                                teacher: true,
                                            }
                                        },
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        // Generate signed URL for the leave file if it exists
        if (leaveRequest.LeaveFile) {
            const signedUrl = await generateSignedUrl("nps", leaveRequest.LeaveFile); 
            // console.log('signedUrl', signedUrl);
            leaveRequest.LeaveFile = signedUrl;
        }
        return res.json(leaveRequest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getLeaveRequestForTeacher(req, res) {
    try {
        const teacherId = req.user.id; // Assuming you have the teacher ID in the request
        // get subjectsId from teacherId
        const subjects = await db.subject.findMany({
            where: {
                tchId: teacherId,
            },
            select: {
                subId: true,
            }
        });
        const subjectIds = subjects.map(subject => subject.subId);

        // get leaveRequest by subjectId
        const leaveRequests = await db.leaveRequest.findMany({
            where: {
                studingTime: {
                    some: {
                        studingTime: {
                            timetable: {
                                subId: {
                                    in: subjectIds,
                                }
                            }
                        }
                    }
                }
            },
            include: {
                leaveRequestType: true,
                student: true,
                studingTime: {
                    include: {
                        teacherApprove: true,
                        studingTime: {
                            include: {
                                timetable: {
                                    include: {
                                        subject:true,
                                        classroom: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });
        if (!leaveRequests) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        // Generate signed URL for the leave file if it exists
        // leaveRequests.forEach(async (leaveRequest) => {
        //     if (leaveRequest.LeaveFile) {
        //         const signedUrl = await generateSignedUrl("nps", leaveRequest.LeaveFile); 
        //         // console.log('signedUrl', signedUrl);
        //         leaveRequest.LeaveFile = signedUrl;
        //     }
        // });
        return res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getLeaveRequestForTeacherByleaveRequestStudingTimeId(req, res) {
    try {
        const leaveId = req.params.id; // Assuming you have the teacher ID in the request
        let leaveRequests = await db.leaveRequest.findMany({
            where: {
                leaveId: leaveId
            },
            include: {
                leaveRequestType: true,
                student: true,
                studingTime: {
                    include: {
                        teacherApprove: true,
                        studingTime: {
                            include: {
                                timetable: {
                                    include: {
                                        subject:{
                                            include: {
                                                teacher: true,
                                            }
                                        },
                                        classroom: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });
        // console.log('leaveRequests', leaveRequests);
        if (!leaveRequests) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        //Generate signed URL for the leave file if it exists
        if (leaveRequests[0].LeaveFile) {
            const signedUrl = await generateSignedUrl("nps", leaveRequests[0].LeaveFile); 
            // console.log('signedUrl', signedUrl);
            leaveRequests[0].LeaveFile = signedUrl;
        }
        return res.json(leaveRequests[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function teacherUpdateStatusLeaveRequest(req, res) {
    const studyTimeId = req.params.id; // Assuming you have the teacher ID in the request
    const teacherId = req.user.id; // Assuming you have the teacher ID in the request
    const status = req.body.action; // Assuming you have the status in the request body

    console.log(req.body)

    try {
        // Check if the leave request exists
        const leaveRequest = await db.leaveRequestStudingTime.findUnique({
            where: {
                leaveRequestStudingTimeId: studyTimeId,
            },
            include: {
                leaveRequest: true,
                studingTime: true,
            }
        });

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Update the teacher approval status
        const updatedLeaveRequest = await db.leaveRequestStudingTime.update({
            where: {
                leaveRequestStudingTimeId: studyTimeId,
            },
            data: {
                teacherApprove: {
                    connect: { tchId: teacherId },
                },
                approverTimestamp: DateTime.now().toJSDate(),
                leaveStatus: status.toUpperCase(), // Convert status to uppercase
            },
        });

        //attendence 
        if (status.toUpperCase() === "APPROVED") {
            const studingTime = await db.studingTime.findUnique({
                where: {
                    studyTimeId: leaveRequest.studyTimeId,
                },
            });
            if (!studingTime) {
                return res.status(404).json({ message: 'Studing time not found' });
            }
            // has attendence?
            const attendence = await db.attendance.findFirst({
                where: {
                    stdId: leaveRequest.leaveRequest.stdId,
                    studingTimeId: studingTime.studyTimeId,
                },
            });
            console.log('attendence', attendence);
            // get attendence medhod
            const attendenceMethodId = await db.attendanceMethod.findFirst({
                where: {
                    attMethodName:"ระบบลา"
                },
            });
            if (attendence) {
                // update attendence
                await db.attendence.update({
                    where: {
                        attId: attendence.attId,
                    },
                    data: {
                        attStatus: "LEAVE",
                        attTimestamp: DateTime.now().toJSDate(),
                        attMethod:{
                            connect: { attMethodId: attendenceMethodId.attMethodId },
                        },
                        operatedBy: "ระบบลา",
                    },
                });
            } else{
                // create attendence
                await db.attendance.create({
                    data: {
                        student: {
                            connect: { stdId: leaveRequest.leaveRequest.stdId },
                        },
                        studingTime: {
                            connect: { studyTimeId: studingTime.studyTimeId },
                        },
                        attTimestamp: DateTime.now().toJSDate(),
                        attMethod: {
                            connect: { attMethodId: attendenceMethodId.attMethodId },
                        },
                        attStatus: "LEAVE",
                        operatedBy: "ระบบลา",
                    },
                });
            }
        }

        return res.json(updatedLeaveRequest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllLeaveRequestForAdmin(req, res) {
    try {
        const leaveRequests = await db.leaveRequest.findMany({
            include: {
                leaveRequestType: true,
                student: true,
                studingTime: {
                    include: {
                        teacherApprove: true,
                        studingTime: {
                            include: {
                                timetable: {
                                    include: {
                                        subject:{
                                            include: {
                                                teacher: true,
                                            }
                                        },
                                        classroom: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });
        if (!leaveRequests) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        // Generate signed URL for the leave file if it exists
        // leaveRequests.forEach(async (leaveRequest) => {
        //     if (leaveRequest.LeaveFile) {
        //         const signedUrl = await generateSignedUrl("nps", leaveRequest.LeaveFile); 
        //         // console.log('signedUrl', signedUrl);
        //         leaveRequest.LeaveFile = signedUrl;
        //     }
        // });
        return res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getLeaveRequestForAdminByLeaveId(req, res) {
    try {
        const leaveId = req.params.id; // Assuming you have the teacher ID in the request
        let leaveRequests = await db.leaveRequest.findMany({
            where: {
                leaveId: leaveId
            },
            include: {
                leaveRequestType: true,
                student: true,
                studingTime: {
                    include: {
                        teacherApprove: true,
                        studingTime: {
                            include: {
                                timetable: {
                                    include: {
                                        subject:{
                                            include: {
                                                teacher: true,
                                            }
                                        },
                                        classroom: true,
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });
        // console.log('leaveRequests', leaveRequests);
        if (!leaveRequests) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        //Generate signed URL for the leave file if it exists
        if (leaveRequests[0].LeaveFile) {
            const signedUrl = await generateSignedUrl("nps", leaveRequests[0].LeaveFile); 
            // console.log('signedUrl', signedUrl);
            leaveRequests[0].LeaveFile = signedUrl;
        }
        return res.json(leaveRequests[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}