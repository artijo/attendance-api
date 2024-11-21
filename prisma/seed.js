import { PrismaClient } from '@prisma/client';
import db from './client.js';
import students from './jsonSeed/student.json' assert { type: 'json' };
import parents from './jsonSeed/parent.json' assert { type : 'json'}
import departments from './jsonSeed/department.json' assert { type:'json'};
import classroomType from './jsonSeed/classroomType.json' assert {type:'json'};
import classrooms from './jsonSeed/classroom.json' assert {type:'json'};
const prisma = new PrismaClient()

async function  main() {

    //create student on database
    try{
        for(const student of students){
            const createStudent = await db.student.create({
                data: {
                    fName:student.fName,
                    lName:student.lName,
                    email:student.email,
                    tel: student.tel,
                    cityzenId: student.cityzenId,
                }
            }) 
            console.log(`student created: ${student.fName} ${student.lName}`)
        }
    }catch(err){
        console.error("Error on seeding student", err)
    }

    //create parent on database
    try {
        for(const parent of parents ){
            const createParent = await db.parent.create({
                data: {
                    name:parent.name,
                    email:parent.email,
                    tel:parent.email
                }
            })
            console.log(`student created: ${parent.name}`)
        }
    }catch(err) {
        console.error("Error on seeding parent", err)
    }
    
    //create parent relationship with student on database
    try{
        const student = await db.student.findMany({})
        const parent = await db.parent.findMany({})
        for(let i = 0; i < student.length; i++){
            const parentHasStudent = await db.studentParent.create({
                data:{
                    prntId:parent[i].prntId,
                    stdId:student[i].stdId
                }
            })
            console.log(`create relation bettween student and parent`)
        }
    }catch(err){
        console.error("Error on parent relationship with studnet seeding", err)
    }

    //create classroomType
    try{
        for(const crType of classroomType){
            const classroomType = await db.classroomType.create({
                data:{
                    classTypeNameThai:crType.cNameTH,
                    classTypeNameEng:crType.cNameEng
                }
                
            })
            console.log(`create classroomType name สาย ${crType.cNameTH}`)
        }
    }catch(err){
        console.error("Error on classroomtype", err)
    }

    //create classroom
    const classroomTypeFind = async (engname) => {
        const classroomtype = await db.classroomType.findFirst({
            where:{
                classTypeNameEng:engname
            }
        })
        // console.log("-----------------------------------")
        // console.log(classroomtype.classTypeId)
        return classroomtype.classTypeId
    }

    try{
        for(const classroom of classrooms){
            const classroomCreate = await db.classrooms.create({
                data:{
                    classLevel:classroom.classLevel,
                    classRoom:classroom.classRoom,
                    academicYear:classroom.adcmicYear,
                    semester:classroom.semester,
                    classroomType: classroomTypeFind(classroom.cType)
                    le
                }
            })
           
        }
    }catch(err){
        console.error("Erro on classroomType",err)
    }

    //create department
    try{
        for(const department of departments){
            const departmentCreate = await db.department.create({
                data:{
                    deptCode:department.deptCode,
                    deptName:department.deptName
                }
            })
            console.log(`create department ${departmentCreate.deptName}`)
        }
    }catch(err) { 
        console.error("Error on department error ", err)
    }

    
}


main()
    .then(async () => {
        await prisma.$disconnect
    })
    .catch(async (err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })
