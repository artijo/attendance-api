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
