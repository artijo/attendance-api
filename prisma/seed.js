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

        // Create classrooms
        for (const classroom of classrooms) {
            await db.classrooms.create({
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
            console.log(`Department created: ${departmentCreate.deptName}`);
        }
        
    } catch (err) {
        console.error("Error during seeding process:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
