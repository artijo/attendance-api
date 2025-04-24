import db from '../prisma/client.js';

export const createClassroom = async (req,res) => {
    const body = req.body;

    if(body){
        try{
            const classroom = await db.classrooms.create({
                data:{
                    classLevel:parseInt(body.classLevel),
                    classRoom:parseInt(body.classRoom),
                    term :{
                        connect: {termId:body.termId}
                    },
                    // classTypeId:body.classTypeId,
                    leader: body.leaderId?{connect:{ldrId:body.leaderId}}:undefined,
                    classroomType:{connect:{classTypeId:body.classTypeId}}
                }
            })
            body.teacherIds?.forEach(async (teacherId) => {
                await db.teacher.update({
                    where:{
                        tchId:teacherId
                    },
                    data:{
                        classId:classroom.classId
                    }
                })
            }
            );
            return res.json({message:"Create Classroom Success"})

        }catch(err){
            console.error(err);
        };
    };
};

export const updateClassroom = async (req,res) => {
    const body = req.body;
    if(body){
        try{
            const classroom = await db.classrooms.update({
                where:{
                    classId:body.classId
                },
                data:{
                    classLevel:parseInt(body.classLevel),
                    classRoom:parseInt(body.classRoom),
                    term :{
                        connect: {termId:body.termId}
                    },
                    classroomType:{connect:{classTypeId:body.classTypeId}},
                    leader: body.leaderId?{connect:{ldrId:body.leaderId}}:undefined,
                }
            })
            body.teacherIds.forEach(async (teacherId) => {
                await db.teacher.update({
                    where:{
                        tchId:teacherId
                    },
                    data:{
                        classId:classroom.classId
                    }
                })
            }
            );
            return res.json({message:"Update Classroom Success"})

        }catch(err){
            console.error(err);
        };
    };
};

export const getAllClassroom = async (req,res) => {
    const {noMembers} = req.query;
    try{
        if(noMembers){
            const classroom = await db.classrooms.findMany({
                where: {
                    deletedAt: null
                },
        });
            return res.json(classroom)
        }

        const classroom = await db.classrooms.findMany({
            where: {
                deletedAt: null
            },
            include: {
                classroomType: true,
                term: true,
                classroomMembers: {
                    include: {
                        student: true
                    }
                }
            },
            orderBy:[{
                classLevel:"asc"},
                {classRoom:"asc"
            }]
        });
        return res.json(classroom)
    }catch(error){
        console.error(error);
    };
};

export const getClassroom = async (req,res) => {
    const uuid = req.params.uuid;
    try{
        const classroom = await db.classrooms.findUnique({
            where:{
                classId:uuid,
                deletedAt: null
            },
            include: {
                classroomType: true,
                term: true,
                classroomMembers: {
                    where: {
                        deletedAt: null
                    },
                    include: {
                        student: true
                    }
                },
                teacher: true,
                leader: true,
                timetable: {
                    where: {
                        deletedAt: null
                    },
                    include: {
                        subject: true,
                    }
                }
            },
        });
        // console.log(classroom);
        return res.status(200).json(classroom)
    }catch(error){
        console.error(error);
    };
};

export const getAllClassroomType = async (req,res) => {
    try{
        const classroomType = await db.classroomType.findMany({
            where: {
                deletedAt: null
            }
        });
        res.json(classroomType)
    }catch(error){
        console.error(error);
    };
}

export const createClassroomType = async (req,res) => {
    const body = req.body;
    if(body){
        try{
            const classroomType = await db.classroomType.create({
                data:{
                    classTypeNameThai:body.classTypeNameThai,
                    classTypeNameEng:body.classTypeNameEng,
                }
            })
            return res.json({message:"Create Classroom Type Success"})

        }catch(err){
            console.error(err);
        };
    };
};

export const updateClassroomType = async (req,res) => {
    const body = req.body;
    const uuid = req.params.uuid;
    if(body){
        try{
            const classroomType = await db.classroomType.update({
                where:{
                    classTypeId:uuid
                },
                data:{
                    classTypeNameThai:body.classTypeNameThai,
                    classTypeNameEng:body.classTypeNameEng,
                }
            })
            return res.json({message:"Update Classroom Type Success"})

        }catch(err){
            console.error(err);
        };
    };
};

export const deleteClassroomType = async (req,res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.classroomType.update({
                where:{
                    classTypeId:uuid
                },
                data: {
                    deletedAt: new Date()
                }
            });
            return res.json({message:"Delete Classroom Type Success"})
        }catch(err){
            console.error(err)
        };
    };
};

export const createClassroomMember = async (req,res) => {
    const body = req.body;
    if(body){
        try{
            const classroomMember = await db.classroomMember.create({
                data:{
                    stdId:body.studentId,
                    classId:body.classId,
                    stdNo:body.stdNo
                }
            })
            return res.json({message:"Create Classroom Member Success"})

        }catch(err){
            console.error(err);
        };
    };
};

export const updateClassroomMember = async (req,res) => {
    const body = req.body;
    const uuid = req.params.uuid;
    if(body){
        try{
            const classroomMember = await db.classroomMember.update({
                where:{
                    classRoomMemeberId:uuid
                },
                data:{
                    stdNo:body.stdNo,
                    behaviourScore:parseInt(body.behaviourScore),
                }
            })
            return res.json({message:"Update Classroom Member Success"})

        }catch(err){
            console.error(err);
        };
    };
}

export const deleteClassroomMember = async (req,res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.classroomMember.update({
                where:{
                    classRoomMemeberId:uuid
                },
                data: {
                    deletedAt: new Date()
                }
            });
        
            res.json({message:"Delete Classroom Member Success"})
        }catch(err){
            console.error(err)
        };
    };
};

export const getClassroomByAcademicYearTerm = async (req, res) => {
    const termId = req.params.termId;
    if(termId) {
        try{
            const classrooms = await db.classrooms.findMany({
                where: {
                    termId: termId,
                    deletedAt: null
                },
                include: {
                    classroomType: true,
                    term: true,
                    classroomMembers: {
                        where: {
                            deletedAt: null
                        },
                        include: {
                            student: true
                        }
                    },
                    teacher: true,
                    leader: true,
                    timetable: {
                        where: {
                            deletedAt: null
                        },
                        include: {
                            subject: true,
                        }
                    }
                },
                orderBy:[{
                    classLevel:"asc"},
                    {classRoom:"asc"}
                ]
            });
            res.json(classrooms);
        }catch(err){
            console.error(err)
        };
    };
};

export const getAcademicYearClassroom = async(req, res) => {
    function semesterSortUnqiueData(VALUE) {
        const uniqueData = [];
        if(VALUE) {
            const semesterMap = VALUE.map((items) => {
                return {semester: items.semester, academicYear: items.academicYear}
            });  
            for(const item of semesterMap) {
                let found = uniqueData.some(
                    (uniqueData) => {
                        uniqueData.semester === item.semester &&
                        uniqueData.academicYear === item.academicYear  
                    }
                          
                );
                if (!found) {
                    uniqueData.push(item);
                }
            };
            return uniqueData;
        };
        return [];
    }
    try{
        const classrooms = await db.classrooms.findMany({
            where: {
                deletedAt: null
            },
            orderBy:{
                academicYear:'asc'
            }
        })
        res.json(semesterSortUnqiueData(classrooms));
    }catch(err){
        console.error(err)
    }
}

export const getClassroomFilterByAcademicYearAndLevel = async (req, res) => {
    const academicYear = req.params.academicYear;
    const classroomLevel = req.params.classroomLevel;
    try{
        const classrooms = await db.classrooms.findMany({
            where:{
                AND: {
                    termId:academicYear,
                    classLevel:parseInt(classroomLevel),
                    deletedAt: null
                }
            },
            orderBy:[{
                classLevel:"asc"},
                {classRoom:"asc"}
            ]
        });
        res.json(classrooms);
    }catch(err){
        console.error(err)
    };
};

export const getTeacherAdvisorClassroom = async (req, res) => {
    const user = req.user;
    // if(!user) res.status(500).json({message: "มีข้อผิดพลาดบางอย่างภายใน server โดยไม่ทราบสาเหตุ"});
    console.log(user)
    try{
        const advisorList = await db.teacher.findMany({
            where: {
                tchId: user.id
            },
        });
        // console.log(advisorList);
        const classroomsIds = advisorList.map((advisor) => advisor.classId);
        if(classroomsIds.some((arrVal) => arrVal === null)) return res.json({not_found:"ไม่มีห้องที่เป็นที่ปรึกษา"});
        const orderByClassrooms = await db.classrooms.findMany({
            where :{
                classId:{
                    in:classroomsIds
                }
            },
            include:{
                classroomMembers:{
                    include:{
                        student:true,
                    }
                },
                term:true,
                classroomType:true,
                leader:true
            },
            orderBy:[
                {term:{
                    termStart: 'desc'
                }}
            ]
        })
        // console.log(orderByClassrooms);
        res.status(200).json(orderByClassrooms);

        
    }catch(error){
        res.status(500).json({message: error});
        console.log(error);
    }
}


export const getClassroomByClassAndSubject = async (req, res) => {
    const subjectId = req.params.subjectId;
    const termId = req.params.termId;
    // console.log(subjectId);
    // console.log(termId);
    try{
        
        const classrooms = await db.classrooms.findMany({
            where: {
                timetable:{
                    some:{
                        subId:subjectId
                    }
                },
                termId:termId,
            },
            include:{
                classroomType:true,
                teacher:true,
                term:true
            },
            orderBy: [
                {classLevel: 'asc'},
                {classRoom: 'asc'}
            ]
            
        });
        console.log(classrooms);
        res.status(200).json(classrooms);

    }catch(error){
        res.status(501).json("เกิดข้อผิดพลาดบางอย่างบน Server");
        console.error(error);
    };
};