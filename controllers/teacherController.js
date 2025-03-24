import db from '../prisma/client.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
    hashPassword,
    comparePassword
} from '../helper/bcrypt.js';
import { inputTeacherForm, inputUpdateTeacherForm, handdleErrorDuplicateKeyTeacher } from '../validator.js';

import {
    createExcelSubjectAttendence
} from '../helper/excel.js'

export const createTeacher = async (req, res) => {
    let body = req.body;
        try{
            if(body.password){
                var password = await hashPassword(body.password) ;// รหัสผ่่านที่ผ่านการเข้ารหัสแล้วเรียบร้อยแล้ว
            }
            const teacher = await db.teacher.create({
                data:{
                    fName:body.fName,
                    lName:body.lName,
                    password:body.password? password : null,
                    email:body.email == '' ? null : body.email,
                    tel:body.tel == '' ? null : body.tel,
                    department : {
                        connect:{
                            deptId:body.deptId
                        }
                    },
                }
            });
            res.json(teacher);
        }catch(err){
            console.error(err);
            return res.status(500).json({message: "เกิดข้อผิดพลาดในการสร้างรายชื่อครู"});
    };
};


export const getAllTeacher = async (req, res) => {
    try{
        const teacherLists = await db.teacher.findMany({
            orderBy:[
                {
                    fName: 'asc'
                }
            ],
            include:{
                department: true
            }
        });
        res.json(teacherLists)
    }catch(err){
        console.error(err)
    }
}

export const updateTeacher = async (req, res) => {
    let body = req.body;
    console.log(body);
    const {uuid} = req.params;
    if(body){
        try{
            let updateData = {
                fName: body.fName,
                lName: body.lName,
                email: body.email == '' ? null : body.email,
                tel: body.tel == '' ? null : body.tel,
                department: {
                    connect: {
                        deptId: body.deptId
                    }
                }
            };
            
            if (body.password || body.password === '') {
                const hashedPassword = await hashPassword(body.password);
                updateData.password = hashedPassword;
            }

            const teacher = await db.teacher.update({
                where: {
                    tchId: uuid
                },
                data: updateData
            });
            res.json(teacher);
        }catch(err){
            return res.status(500).json({message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลครู"});
        }
    };
}

export const getTeacher = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            const teacher = await db.teacher.findFirstOrThrow({
                where:{
                    tchId:uuid
                },
                include: {
                    department: true,
                    classroom: true
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

        const timetableIds = timetable.map(item => item.timetableId);

        const objectTimetableForSearch = {
            timetableId: {
                in: timetableIds
            }
        };

        const studingTime = await db.studingTime.findMany({
            where: objectTimetableForSearch,
            select:{
                studyTimeId:true,
            },
            orderBy:{
                studingTimeDate:'asc'
            }
        });
    

        const studentInThisClassRoom = await db.classroomMember.findMany({
            where:{
                classId:classroomId
            },
            select:{
                stdId:true,
            }
        });

        
        const stutingTimes = studingTime.map((item) => item.studyTimeId);

        const studentInClassroom = studentInThisClassRoom.map((item) => item.stdId);

        const student = await db.student.findMany({
            select:{
                fName:true,
                lName:true,
                attendance:{
                    where:{
                        AND:{
                            stdId: {
                                in: studentInClassroom
                            },
                            studingTimeId:{
                                in: stutingTimes
                            }
                        }
                    }
                },
            },
        });

        const subjectName = await db.subject.findFirst({
            select:{
                subNameEng:true
            }
        });
       
        const fileName = await createExcelSubjectAttendence(student,subjectName.subNameEng);
        const file = path.join(__dirname, `../public/${fileName}`);
        // console.log(file);
        res.sendFile(file);
    }catch(err){
        console.error(err)
    };
}

export const getAllDepartment = async (req, res) => {
    try{
        const department = await db.department.findMany();
        res.json(department);
    }catch(err){
        console.error(err);
    }
}

export const getDepartment = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            const department = await db.department.findFirstOrThrow({
                where:{
                    deptId:uuid
                }
            });
            res.json(department);
        }
        catch(err){
            console.error(err);
        };
    };
}

export const createDepartment = async (req, res) => {
    const body = req.body;
    if(body){
        try{
            const department = await db.department.create({
                data:{
                    deptName:body.deptName
                }
            });
            res.json(department);
        }catch(err){
            console.error(err);
        }
    };
}

export const updateDepartment = async (req, res) => {
    const body = req.body;
    const {uuid} = req.params;
    if(body){
        try{
            
            const department = await db.department.update({
                where:{
                    deptId: uuid
                },
                data:{
                    deptName: body.deptName
                }
            });
            res.json(department);
        }catch(err){
            console.error(err);
        }
    };
}

export const deleteDepartment = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.department.delete({
                where:{
                    deptId:uuid
                }
            });
            return  res.json({
                message: 'delete success'
            });
        }catch(err){
            console.error(err);
        }
    }
}