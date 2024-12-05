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