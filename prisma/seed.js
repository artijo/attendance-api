import { PrismaClient } from '@prisma/client';
import db from './client.js';
import students from './jsonSeed/student.json' assert { type: 'json' };
import parents from './jsonSeed/parent.json' assert { type: 'json' };
import departments from './jsonSeed/department.json' assert { type: 'json' };
import classroomType from './jsonSeed/classroomType.json' assert { type: 'json' };
import classrooms from './jsonSeed/classroom.json' assert { type: 'json' };
import academicterm from './jsonSeed/academicterm.json' assert { type: 'json' };


import {
    hashPassword,
} from '../helper/bcrypt.js';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

async function main() {
    try {

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
                    deptCode: department.deptCode,
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
            { subTypeCode: "GEN", subTypeNameThai: "ทั่วไป", subTypeNameEng: "General" },
            { subTypeCode: "MATH", subTypeNameThai: "คณิตศาสตร์", subTypeNameEng: "Mathematics" },
            { subTypeCode: "SCI", subTypeNameThai: "วิทยาศาสตร์", subTypeNameEng: "Science" },
            { subTypeCode: "ENG", subTypeNameThai: "ภาษาอังกฤษ", subTypeNameEng: "English" },
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

            // const timetables = [
            //     {
            //       subId: subjectArrayId[0], // วิชา: GEN101
            //       classId: classroomIdArray[0], // ห้อง: Class 101
            //       timeStart: "08:40:00",
            //       timeEnd: "09:30:00",
            //       timeLate: "08:55:00",
            //       dayOfWeek: 5, // Saturday
            //     },
            //     {
            //       subId: subjectArrayId[1], // วิชา: MATH101
            //       classId: classroomIdArray[0], // ห้อง: Class 101
            //       timeStart: "09:30:00",
            //       timeEnd: "10:20:00",
            //       timeLate: "09:45:00",
            //       dayOfWeek: 5, // Saturday
            //     },
            //     {
            //       subId: subjectArrayId[2], // วิชา: SCI101
            //       classId: classroomIdArray[0], // ห้อง: Class 101
            //       timeStart: "10:20:00",
            //       timeEnd: "11:10:00",
            //       timeLate: "10:35:00",
            //       dayOfWeek: 5, // Saturday
            //     },
            //     {
            //       subId: subjectArrayId[3], // วิชา: ENG101
            //       classId: classroomIdArray[0], // ห้อง: Class 101
            //       timeStart: "11:10:00",
            //       timeEnd: "12:00:00",
            //       timeLate: "11:25:00",
            //       dayOfWeek: 5, // Saturday
            //     },
            //   ];
              
              
            //   const timeTableIdArray = [];
            //   for (const timetable of timetables) {
            //     const timetableCreate = await prisma.timetable.create({
            //       data: timetable,
            //     });
            //     timeTableIdArray.push(timetableCreate);
            //     console.log(`Timetable created for Subject ${timetable.subId} on Day ${timetable.dayOfWeek}`);
            //   }

            //   for (const timetableId of timeTableIdArray) {
            //     const formatTime = (time) => {
            //         const dt = DateTime.now();
            //         const utfString = `${dt.year}-${dt.month}-${dt.day}T${time}`;
            //         const timeInBangkok = DateTime.fromISO(utfString, { zone: 'UTC' });
            //         return timeInBangkok;
            //     }
               
            //     const timeInBangkok = DateTime.fromISO(timetableId.timeStart, { zone: 'UTC' })
            //     // บันทึกลงฐานข้อมูล
            //     const studingTime = await db.studingTime.create({
            //       data: {
            //         timetableId: timetableId.timetableId,
            //         studingTimeDate: formatTime(timetableId.timeStart), // บันทึกในรูปแบบ ISO-8601
            //       },
            //     });
            //     console.log("Studing Time Created:", studingTime);
            //   }
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
              
    } catch (err) {
        console.error("Error during seeding process:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
