import db from '../prisma/client.js';

export const createClassroom = async (req,res) => {
    const body = req.body;
    if(body){
        try{
            const classroom = await db.classrooms.create({
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
                        teacherId:teacherId
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
                        teacherId:teacherId
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
                classroomMembers: true,
                teacher: true,
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