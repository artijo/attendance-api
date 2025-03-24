import db from '../prisma/client.js';

export const createSubjectType = async (req, res) => {
    const body = req.body;
    if(body){
        try{
            const createSubjectType = await db.subjectType.create({
                data:{
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
    const subjectType = req.params.UUID;
    if(subjectType){
        try{
            const subjectId = db.subjectType.findFirstOrThrow({
                where:{
                    subTypeId:subjectType
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
        const subjectType = await db.subjectType.findMany();
        res.json(subjectType);
    }catch(err){
        console.error(err);
        res.json(err)
    };
    
};

export const editSubjectType = async (req, res) => {
    const body = req.body
    const {uuid} = req.params;
    if(body){
        try{
            const subjectType = await db.subjectType.update({
                where:{
                    subTypeId:uuid
                },
                data:{
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
    const subjectTypeId = req.params.uuid;
    if(subjectTypeId){
        try{
            await db.subjectType.delete({
                where:{
                    subTypeId:subjectTypeId
                }
            })
            return res.json({message:"Delete Success"})
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
                    subCredit:parseFloat(body.subCredit),
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

export const editSubject = async (req, res) => {
    const body = req.body;
    const {UUID} = req.params;
    if(body) {
        try{
            const subject = await db.subject.update({
                where:{
                    subId: UUID
                },
                data:{
                    subCode:body.subCode,
                    subNameEng:body.subNameEng,
                    subNameThai:body.subNameThai,
                    subCredit:parseFloat(body.subCredit),
                    tchId:body.tchId,
                    subTypeId:body.subTypeId
                }
            });
            res.json(subject);
        }catch(err){
            console.error(err);
            res.json(err);
        };
    };
};

export const deleteSubject = async (req, res) => {
    const subjectId = req.params.UUID;
    if(subjectType){
        try{
            await db.subject.delete({
                where:{
                    subId: subjectId
                }
            });
            res.json(subjectId);
        }catch(err){
            console.error(err);
        };
    };
};

export const getSubject = async (req, res) => {
    const subjectId = req.params.UUID;
    if(subjectId) {
        try{
            const subject = await db.subject.findFirst({
                where: {
                    subId: subjectId
                },
                include:{
                    subjectType:true,
                    teacher:true,
                    timetable: {
                        include: {
                            classroom: true,
                            studyTime: {
                                include: {
                                    attendance: true
                                }
                            }
                        }
                    }
                }
            })
            res.json(subject);
        }catch(err){
            console.error(err);
        };
    };
};

export const getAllSubject = async (req, res) => {
    try{
        const subject = await db.subject.findMany({
            include:{
                subjectType:true,
                teacher:true
            }
        });
        res.json(subject);
    }catch(err){
        console.error(err);
    };
}

export const getSubjectByTeacher = async (req, res) => {
    if(req.user){
        try{
            const subject = await db.subject.findMany({
                where:{
                    tchId: req.user.id
                },
                include:{
                    subjectType:true,
                    teacher:true,
                    timetable: {
                        include: {
                            classroom: true,
                            studyTime: true
                        }
                    }
                }
            });
            res.json(subject);
        }catch(err){
            console.error(err);
        };
    };
}