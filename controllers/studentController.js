import db from '../prisma/client.js';

export const test = async (req,res) =>{
    try{
        const data = await db.student.findMany({});
        res.json(data);
    }catch(error){
        console.log({"error":error})
    }
}

