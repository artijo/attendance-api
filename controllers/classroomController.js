import db from '../prisma/client.js';

export const createClassroom = async (req,res) => {
    const body = req.body;
    if(body){
        try{
            const classroom = await db.classrooms.create({
                data:{
                    classLevel:body.cLevel,
                    classRoom:body.cRoom,
                    semester:body.semester,
                    classTypeId:body.cTypeId,
                    leaderId:body.leaderId,
                }
            })

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