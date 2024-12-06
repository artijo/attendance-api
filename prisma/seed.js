import { PrismaClient } from '@prisma/client';
import db from './client.js';
import students from './jsonSeed/student.json' assert { type: 'json' };
import parents from './jsonSeed/parent.json' assert { type: 'json' };
import departments from './jsonSeed/department.json' assert { type: 'json' };
import classroomType from './jsonSeed/classroomType.json' assert { type: 'json' };
import classrooms from './jsonSeed/classroom.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
    try {
        // Create students
        for (const student of students) {
            await db.student.create({
                data: {
                    fName: student.fName,
                    lName: student.lName,
                    email: student.email,
                    tel: student.tel,
                    cityzenId: student.cityzenId,
                },
            });
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
                password: 'ome31231',
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

        let classroomIdArray = [];
        let departmentIdArray = [];
        // Create classrooms
        for (const classroom of classrooms) {
            const classroomCreate = await db.classrooms.create({
                data: {
                    classLevel: classroom.classLevel,
                    classRoom: classroom.classRoom,
                    academicYear: classroom.adcmicYear,
                    semester: classroom.semester,
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
            password: "securepassword123",
            deptId: departmentIdArray[0],
            classId: classroomIdArray[0],
            },
            {
            tchCode: "TCH002",
            fName: "Jane",
            lName: "Smith",
            email: "jane.smith@example.com",
            tel: "0987654321",
            password: "securepassword456",
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
        
          // Add Subjects
          const subjects = [
            { subCode: "GEN101", subNameThai: "พื้นฐานทั่วไป", subNameEng: "General Basics", subCredit: 3, tchId: teacherIdArray[0], subTypeId: subjectTypeIds[0] },
            { subCode: "MATH101", subNameThai: "คณิตศาสตร์พื้นฐาน", subNameEng: "Basic Mathematics", subCredit: 3, tchId:  teacherIdArray[0], subTypeId: subjectTypeIds[1] },
            { subCode: "SCI101", subNameThai: "วิทยาศาสตร์ทั่วไป", subNameEng: "General Science", subCredit: 3, tchId:  teacherIdArray[1], subTypeId: subjectTypeIds[2] },
            { subCode: "ENG101", subNameThai: "ภาษาอังกฤษขั้นพื้นฐาน", subNameEng: "Basic English", subCredit: 3, tchId:  teacherIdArray[1], subTypeId: subjectTypeIds[3] },
          ];
        
          for (const subject of subjects) {
            await prisma.subject.create({ data: subject });
          }
        
    } catch (err) {
        console.error("Error during seeding process:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
