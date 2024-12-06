import db from '../prisma/client.js';

export const createSubjectType = async (req, res) => {
    const body = req.body;
    if(body){
        try{
            const createSubjectType = await db.subjectType.create({
                data:{
                    subTypeCode:body.subTypeCode,
                    subTypeNameThai:body.subTypeNameThai,
                    subTypeNameEng:body.subTypeNameEng
                }
            });
            res.json(createSubjectType)
        }catch(err){
            console.error(err)
            res.json(err)
        };
    };
    
};

export const selectSubjectType = async (req, res) => {
    const uuid = req.params.UUID;
    if(uuid){
        try{
            const subjectId = db.subjectType.findFirstOrThrow({
                where:{
                    subTypeId:uuid
                }
            });
            res.json(subjectId);
        }catch(err){
            console.error(err);
            res.json(err);
        };
    };
    
};

export const getAllSubjectType = async (req, res) => {
    try{
        const subjectArrayType = await db.subjectType.findMany({});
        res.json(subjectArrayType);
    }catch(err){
        console.error(err);
        res.json(err)
    };
    
};

export const editSubjectType = async (req, res) => {
    const body = req.body
    if(body){
        try{
            const subjectType = db.subjectType.update({
                where:{
                    subTypeId:body.UUID
                },
                data:{
                    subTypeCode:body.subTypeCode,
                    subTypeNameThai:body.subTypeNameThai,
                    subTypeNameEng:body.subTypeNameEng
                }
            });
            res.json(subjectType)
        }catch(err){
            console.error(err);
            res.json(err)
        };
    };
    
};

export const deleteSubejectType = async (req, res) => {
    const subjectTypeId = req.params.UUID;
    if(subjectTypeId){
        try{
            await db.subjectType.delete({
                where:{
                    subTypeId:subjectTypeId
                }
            })
            console.log("delete successfully!")
        }catch(err){
            console.error(err);
            res.json(err);
        };
    };
};


export const createSubject = async (req, res) => {
    const body = req.body;
    if(body){
        try{
            const subjectCreate = await db.subject.create({
                data:{
                    subCode:body.subCode,
                    subNameThai:body.subNameThai,
                    subNameEng:body.subNameEng,
                    subCredit:body.subCredit,
                    tchId:body.tchId,
                    subTypeId:body.subTypeId
                }
            });
            res.json(subjectCreate);
        }catch(err){
            console.error(err);
            res.json(err)
        };
    };
};