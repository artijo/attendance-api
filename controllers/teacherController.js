import db from '../prisma/client.js';
import fs from 'fs';
//
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//

import {
    hashPassword,
    comparePassword
} from '../helper/bcrypt.js';

import {
    createExcelSubjectAttendence
} from '../helper/excel.js'

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