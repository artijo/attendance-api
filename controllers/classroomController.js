import db from '../prisma/client.js';

export const createClassroom = async (req,res) => {
    const body = req.body;
    console.log(body.classTypeId);
    if(body){
        try{
            const classroom = await db.classrooms.create({
                data:{
                    classLevel:parseInt(body.classLevel),
                    classRoom:parseInt(body.classRoom),
                    academicYear:parseInt(body.academicYear),
                    semester:parseInt(body.semester),
                    // classTypeId:body.classTypeId,
                    leader: body.leaderId?{connect:{leaderId:body.leaderId}}:undefined,
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
                    academicYear:parseInt(body.academicYear),
                    semester:parseInt(body.semester),
                    classTypeId:body.classTypeId,
                    leaderId:body.leaderId,
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
    try{
        const classroom = await db.classrooms.findMany({
            include: {
                classroomType: true,
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
                classId:uuid
            },
            include: {
                classroomType: true,
                classroomMembers: {
                    include: {
                        student: true
                    }
                },
                teacher: true,
                leader: true,
                timetable: {
                    include: {
                        subject: true,
                    }
                }
            },
        });
        return res.json(classroom)
    }catch(error){
        console.error(error);
    };
};

export const getAllClassroomType = async (req,res) => {
    try{
        const classroomType = await db.classroomType.findMany({
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
            await db.classroomType.delete({
                where:{
                    classTypeId:uuid
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
            await db.classroomMember.delete({
                where:{
                    classRoomMemeberId:uuid
                }
            });
        
            res.json({message:"Delete Classroom Member Success"})
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
            orderBy:{
                academicYear:'asc'
            }
        })
        res.json(semesterSortUnqiueData(classrooms));
    }catch(err){
        console.error(err)
    }
}