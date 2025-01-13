import db from '../prisma/client.js';


export const getAllAcademicTerms = async (req,res) => {
    try{
        const academicTerms = await db.academicTerms.findMany({
        });
        res.json(academicTerms)
    }catch(error){
        console.error(error);
    };
}


export const createTerm = async (req, res) => {
    const body = req.body;
    console.log(body)
    if(body) {
        try{
            await db.academicTerms.create({
                data:{

                }
            })
        }catch(error){
            console.error(error);
        };
    }
    
};