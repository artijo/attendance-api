import { PrismaClient } from '@prisma/client';
import db from './client.js';
import { hashPassword } from '../helper/bcrypt.js';
import { DateTime } from 'luxon';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

async function loadJsonFile(filename) {
    const filePath = path.join(__dirname, 'jsonSeed', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}


async function main() {
    try {

        const students = await loadJsonFile('student.json');
        const parents = await loadJsonFile('parent.json');
        const departments = await loadJsonFile('department.json');
        const classroomType = await loadJsonFile('classroomType.json');
        const classrooms = await loadJsonFile('classroom.json');
        const academicterm = await loadJsonFile('academicterm.json');
        const activityTypes = await loadJsonFile('activityType.json');

        //Create admin 

        const adminCreate = await db.admin.createMany({
            data:[
                {
                    name:'admin test',
                    password: await hashPassword('12345678'),
                    username: 'admin01pp',
                    email: 'admin',
                    tel: '0651088956',
                }
            ]
        })


        // Create students
        let studentArray = [];
        for (const student of students) {
            const studentCreate = await db.student.create({
                data: {
                    stdId: student.stdId,
                    title: student.title,
                    fName: student.fName,
                    lName: student.lName,
                    email: student.email,
                    tel: student.tel,
                    cityzenId: student.cityzenId,
                },
            });
            studentArray.push(studentCreate.stdId);
            console.log(`Student created: ${student.fName} ${student.lName}`);
        }

        // Create parents
        for (const parent of parents) {
            await db.parent.create({
                data: {
                    name: parent.name,
                    email: parent.email,
                    tel: parent.tel,
                },
            });
            console.log(`Parent created: ${parent.name}`);
        }

        // Create relationships between students and parents
        const studentList = await db.student.findMany({});
        const parentList = await db.parent.findMany({});
        for (let i = 0; i < studentList.length; i++) {
            await db.studentParent.create({
                data: {
                    prntId: parentList[i].prntId,
                    stdId: studentList[i].stdId,
                },
            });
            console.log(`Relationship created between student and parent.`);
        }

        // Create leader
        const leader = await db.leader.create({
            data: {
                fName: 'Peerapon',
                lName: 'Loasu-angkoon',
                password:  await hashPassword('ome31231za'),
                email: 'peerapon@gmail.com',
                tel: '0651088956',
            },
        });
        const leaderUU_ID = leader.ldrId;

        // Create classroom types
        for (const crType of classroomType) {
            await db.classroomType.create({
                data: {
                    classTypeNameThai: crType.cNameTH,
                    classTypeNameEng: crType.cNameEng,
                    ...(crType.cTypeId && { classTypeId: crType.cTypeId })
                },
            });
            console.log(`Classroom type created: สาย ${crType.cNameTH}`);
        }

        // Helper function to find classroom type ID
        const classroomTypeFind = async (engname) => {
            const classroomtype = await db.classroomType.findFirst({
                where: {
                    classTypeNameEng: engname,
                },
            });
            return classroomtype.classTypeId;
        };

        // Create academic term
        for (const term of academicterm) {
            await db.academicTerms.create({
                data: {
                    termId: term.termId,
                    academicYear: term.academicYear,
                    semester: term.semester,
                    termStart: term.termStart,
                    termEnd: term.termEnd,
                },
            });
            console.log(`Academic term created: ${term.academicYear} ภาคเรียนที่ ${term.semester}`);
        }

        let classroomIdArray = [];
        let departmentIdArray = [];
        // Create classrooms
        for (const classroom of classrooms) {
            const classroomCreate = await db.classrooms.create({
                data: {
                    classLevel: classroom.classLevel,
                    classRoom: classroom.classRoom,
                    term: {
                        connect: {
                            termId: classroom.termId
                        }
                    },
                    classroomType: {
                        connect: {
                            classTypeId: await classroomTypeFind(classroom.cType),
                        },
                    },
                    leader: {
                        connect: {
                            ldrId: leaderUU_ID,
                        },
                    },
                },
            });
            classroomIdArray.push(classroomCreate.classId)
            // console.log(`classroom id array ${classroomIdArray}`)
            console.log(`Classroom created: Level ${classroom.classLevel}, Room ${classroom.classRoom}`);
        }
        
        await db.classroomMember.createMany({
            data:[
                {stdId:studentArray[0], classId:classroomIdArray[0], stdNo:"01"},
                {stdId:studentArray[1], classId:classroomIdArray[0], stdNo:"02"}
            ]
        })

        // Create departments
        for (const department of departments) {
            const departmentCreate = await db.department.create({
                data: {
                    deptName: department.deptName,
                },
            });
            departmentIdArray.push(departmentCreate.deptId)
            console.log(`Department created: ${departmentCreate.deptName}`);
        }

                // Teachers data
        const teachers = [
            {
            tchCode: "TCH001",
            fName: "John",
            lName: "Doe",
            email: "john.doe@example.com",
            tel: "1234567890",
            password:  await hashPassword("securepassword123"),
            deptId: departmentIdArray[0],
            classId: classroomIdArray[0],
            },
            {
            tchCode: "TCH002",
            fName: "Jane",
            lName: "Smith",
            email: "jane.smith@example.com",
            tel: "0987654321",
            password:await  hashPassword("securepassword456"),
            deptId: departmentIdArray[1],
            classId: classroomIdArray[1],
            },
        ];


        let teacherIdArray = [];
        // Insert teachers into the database
        for (const teacher of teachers) {
            const teacherCreate = await prisma.teacher.create({
                data: teacher,
            });
            teacherIdArray.push(teacherCreate.tchId);
            console.log(`Teacher created: ${teacherCreate.fName} ${teacherCreate.lName}`);
        }

        const subjectTypes = [
            { subTypeNameThai: "ทั่วไป", subTypeNameEng: "General" },
            { subTypeNameThai: "คณิตศาสตร์", subTypeNameEng: "Mathematics" },
            { subTypeNameThai: "วิทยาศาสตร์", subTypeNameEng: "Science" },
            {  subTypeNameThai: "ภาษาอังกฤษ", subTypeNameEng: "English" },
          ];

        const subjectTypeIds = [];
          for (const type of subjectTypes) {
            const subjectTypeId = await prisma.subjectType.create({ data: type });
            subjectTypeIds.push(subjectTypeId.subTypeId);
          };
        
        
            const subjectArrayId = [];
            // Add Subjects
            const subjects = [
                { subCode: "GEN101", subNameThai: "พื้นฐานทั่วไป", subNameEng: "General Basics", subCredit: 3, tchId: teacherIdArray[0], subTypeId: subjectTypeIds[0] },
                { subCode: "MATH101", subNameThai: "คณิตศาสตร์พื้นฐาน", subNameEng: "Basic Mathematics", subCredit: 3, tchId:  teacherIdArray[0], subTypeId: subjectTypeIds[1] },
                { subCode: "SCI101", subNameThai: "วิทยาศาสตร์ทั่วไป", subNameEng: "General Science", subCredit: 3, tchId:  teacherIdArray[1], subTypeId: subjectTypeIds[2] },
                { subCode: "ENG101", subNameThai: "ภาษาอังกฤษขั้นพื้นฐาน", subNameEng: "Basic English", subCredit: 3, tchId:  teacherIdArray[1], subTypeId: subjectTypeIds[3] },
            ];
            
            for (const subject of subjects) {
                const subjectCreate = await prisma.subject.create({ data: subject });
                subjectArrayId.push(subjectCreate.subId);
            };
              const attendanceMethods = [
                {
                    attMethodName:"ยังไม่ลงชื่อ",
                },
                {
                    attMethodName:"เช็คชื่อด้วยระบบ Gps"
                },
                {
                    attMethodName:"เช็คชื่อด้วยคุณครู"
                }
              ];
              const attendanceMethodIdArray = [];
              for(const attendanceMethod of attendanceMethods){
                const attendanceMethodCreate = await db.attendanceMethod.create({data:attendanceMethod});
                attendanceMethodIdArray.push(attendanceMethodCreate.attMethodId);
              };

            //   seed activityType
            
            for(const activityType of activityTypes){
                const activityTypeCreate = await db.activityType.create({data:activityType});
                console.log(`Activity Type Created: ${activityTypeCreate.actTypeName}`);
            }
    } catch (err) {
        console.error("Error during seeding process:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
