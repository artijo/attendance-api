import db from '../prisma/client.js';

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
    let classr = req.query.class;
    if(req.query.class !== "all"){
        classr = classr.split("-");
        try{
            const classroom = await db.classrooms.findFirst({
                where:{
                    classLevel:parseInt(classr[0]),
                    classRoom:parseInt(classr[1])
                }
            });
            const student = await db.classroomMember.findMany({
                where:{
                    classId: classroom.classId
                },
                select:{
                    student:true
                }
            });
            const studentArray = student.map((item) => item.student);
            return res.json(studentArray);
        }catch(error){
            console.error(error);
        };
    };
    try{
        const student = await db.student.findMany({
        });
        // console.log(student);
        return res.json(student)
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
                },
                include:{
                    attendance:true,
                    classroomMembers:{
                        include:{
                            classroom:true
                        }
                    }
                }
            });
            // console.log(student);
           return res.json(student);
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

 




