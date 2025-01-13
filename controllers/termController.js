import { DateTime, Zone } from 'luxon';
import db from '../prisma/client.js';

export const getAllAcademicTerms = async (req,res) => {
    try{
        const academicTerms = await db.academicTerms.findMany({
            orderBy:[
                {academicYear:'asc'},
                {semester:'asc'}
            ]
        });
        res.json(academicTerms)
    }catch(error){
        console.error(error);
    };
}

export const getOneAcademicTerm = async (req, res) => {
    const termId = req.params.termId;
    if(termId){
        try{
            const academicTerm = await db.academicTerms.findFirst({
                where:{
                    termId:String(termId)
                }
            });
            res.json(academicTerm);
        }catch(error){
            console.error(error);
        };
    };
};

export const createTerm = async (req, res) => {
    const body = req.body;
    const acadamicyear = parseInt(body.academicYear) - 543;
    const semester = parseInt(body.semester);
    const termStart = DateTime.fromISO(`${body.termStart}T00:00:00Z`, {zone: 'UTC'});
    const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00Z`, {zone:'UTC'});
    if(body) {
        try{
            await db.academicTerms.create({
                data:{
                    academicYear:acadamicyear,
                    semester:semester,
                    termStart:termStart,
                    termEnd:termEnd
                }
            });
            res.json({msg: "create acadamicyear and term 100%"});
        }catch(error){
            console.error(error);
        };
    }
    
};

export const updateTerm = async (req, res) => {
    const body = req.body;
    const termId = body.termId;
    const acadamicyear = parseInt(body.academicYear) - 543;
    const semester = parseInt(body.semester);
    const termStart = DateTime.fromISO(`${body.termStart}T00:00:00Z`, {zone: 'UTC'});
    const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00Z`, {zone:'UTC'});
    if(body){
        try{
            await db.academicTerms.update({
                where:{
                    termId: termId
                },
                data:{
                    academicYear:acadamicyear,
                    semester:semester,
                    termStart:termStart,
                    termEnd:termEnd
                }
            });
            res.json({msg:"update term 100%"});
        }catch(error){
            console.error(error);
        };
    };

};

export const deleteTerm = async (req, res) => {
    const termId = req.params.termId;
    if(termId){
        try{
            await db.academicTerms.delete({
                where:{
                    termId: String(termId)
                }
            });
            res.json({msg:"delete term 100%"});
        }catch(error){
            console.error(error);
        };
    };
};

