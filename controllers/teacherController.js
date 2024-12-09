import db from '../prisma/client.js';
import {
    hashPassword,
    comparePassword
} from '../helper/bcrypt.js';

export const createTeacher = async (req, res) => {
    const body = req.body;
    const password = await hashPassword(body.password) ;// รหัสผ่่านที่ผ่านการเข้ารหัสแล้วเรียบร้อยแล้ว
    if(body){
        try{
            const teacher = await db.teacher.create({
                data:{
                    fName:body.fName,
                    lName:body.lName,
                    password:password,
                    email:body.email,
                    tel:body.tel,
                    deptId:body.departmentId,
                    classId:body.classroomId,
                    tchCode:body.tchCode
                }
            });
            res.json(teacher);
        }catch(err){
            console.log(err);
        }
    };
};


export const getAllTeacher = async (req, res) => {
    try{
        const teacherLists = await db.teacher.findMany({
            orderBy:[
                {
                    fName: 'desc'
                }
            ]
        });
        res.json(teacherLists)
    }catch(err){
        console.error(err)
    }
}

export const updateTeacher = async (req, res) => {
    const body = req.body;
    const password = await hashPassword(body.password) ;// รหัสผ่่านที่ผ่านการเข้ารหัสแล้วเรียบร้อยแล้ว
    if(body){
        try{
            const teacher = await db.teacher.update({
                where:{
                    tchId:body.tchId
                },
                data:{
                    fName:body.fName,
                    lName:body.lName,
                    password:password,
                    email:body.email,
                    tel:body.tel,
                    deptId:body.departmentId,
                    classId:body.classroomId,
                    tchCode:body.tchCode
                }
            });
            res.json(teacher);
        }catch(err){
            console.log(err);
        }
    };
}

export const getTeacher = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            const teacher = await db.student.findFirstOrThrow({
                where:{
                    stdId:uuid
                }
            });
            res.json(teacher);
        }
        catch(err){
            console.error(err);
        };
    };
};

export const deleteTeacher = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.student.delete({
                where:{
                    stdId:uuid
                }
            })
        }catch(err){
            console.error(err)
        };
    };
};


export const getStudentAllAttendenceExcelOneSubject = async (req, res) => { // export สรุปการเข้าเรียนของนักเรียนทุกคนแต่วิชาเดียว
    const subjectId = req.body.subjectId; // uuid วิชา
    const classroomId = req.body.classId; // uuid ห้องเรียน

    // uuid ของ 
    try{
        const studentInThisClassRoom = await db.classroomMember.findMany({
            where:{
                classId:classroomId
            },
            select:{
                stdId:true,
                stdNo:true,
                student:{
                    select:{
                        fName:true,
                        lName:true
                    }
                }
            }
        });
        // res.json(studentInThisClassRoom); 


        const timetable = await db.timetable.findMany({
            where:{
                AND:{
                    subId:subjectId,
                    classId:classroomId
                }
            },
            select:{
                timetableId:true
            }
        })
        
       // สร้าง array ของ timetableId
        const timetableIds = timetable.map(item => item.timetableId);

        // สร้าง JSON object สำหรับ Prisma query โดยใช้ `in` สำหรับหลายค่า
        const objectTimetableForSearch = {
            timetableId: {
                in: timetableIds
            }
        };

        // ตรวจสอบ query ที่จะใช้
        // console.log(objectTimetableForSearch);

        // ใช้ใน Prisma query
        const studingTime = await db.studingTime.findMany({
            where: objectTimetableForSearch,
            select:{
                attendance:{
                    include:{
                        student:true
                    },
                }
            },
            orderBy:{
                studingTimeDate:'asc'
            }
        });
        res.json(studingTime);  
        // ส่งผลลัพธ์
        // res.json(studingTime);
        
    }catch(err){
        console.error(err)
    };

}