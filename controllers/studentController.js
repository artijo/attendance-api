import db from '../prisma/client.js';


export const test = async (req,res) =>{
    try{
        const data = await db.student.findMany({});
        res.json(data);
    }catch(err){
        console.log({"error":err});
    };
};

export const createStudent = async (req, res) => { // สร้างรายชื่อนักเรียนรายบุคคล
    const body = req.body;
    if(body){
        try{
            const student = await db.student.create({
                data:{
                    fName:body.fName,
                    lName:body.lName,
                    email:body.email,
                    tel:body.tel,
                    cityzenId:body.cityzenId,
                }
            });
            res.json({message: `สร้าง ${student.fName} ${student.lName} แล้ว`});
        }catch(err){
            console.error(err);
        }
    };
};

export const getAllStudent = async (req, res) => { // ดึงรายชื่อนักเรียนทั้งหมด
    try{
        const student = await db.student.findMany({});
        res.json(student)
    }catch(error){
        console.error(error);
    };
};

export const getStudent = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            const student = await db.student.findFirstOrThrow({
                where:{
                    stdId:uuid
                }
            });
            res.json(student);
        }
        catch(err){
            console.error(err);
        };
    };
};

export const deleteStudent = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.student.delete({
                where:{
                    stdId:uuid
                }
            });
        }catch(err){
            console.error(err)
        };
    };
};

export const updateStudent = async(req, res) => {
    const body = req.body;
    if(body);{
        try{
            const student = await db.student.update({
                where:{
                    stdId: String(body.stdId)
                },
                data:{
                    fName:body.fName,
                    lName:body.lName,
                    email:body.email,
                    tel:body.tel,
                    cityzenId:body.cityzenId,
                }
            });
            res.json(student);
        }catch(error){
            console.error(error);
        };
    };
};

 




