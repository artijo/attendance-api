import db from '../prisma/client.js';

export const getStudentClassroomTerm = async (req, res) => {
    const stdId = req.params.stdId;
    try{
        const studentTerm = await db.student.findFirst({
            where : {
                stdId: stdId
            },
            select:{
                classroomMembers:{
                    orderBy:{
                        classroom:{
                            academicYear:'asc',
                        }
                    },
                    select:{
                        classroom:true,
                    }
                }
            }
        });
        // console.log(studentTerm.classroomMembers)
        res.json(studentTerm.classroomMembers);
    }catch(err) {
        console.error(err);
    };
};

export const attendenceBySubjectAndStuId = async (req, res) => {
    const classroomId = req.params.classroomId;
    const studentId = req.params.studentId;
    
    try{
        const attendenceBySubject = await db.timetable.findMany({
            where:{
                classId: String(classroomId),
            },
            select: {
                subject:true,
                studyTime:{
                    select:{
                        attendance:{
                            orderBy:{
                                createdAt:'asc'
                            },
                            where:{
                                stdId:studentId
                            }
                        }
                    }
                }
            }
        });

        res.json(attendenceBySubject);
    }catch(err) {
        console.error(err);
    };
};