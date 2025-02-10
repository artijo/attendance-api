import { hashPassword } from '../helper/bcrypt.js';
import db from './client.js';
import { DateTime } from 'luxon';
// seed data Object
import studentList from './jsonSeed/student.json' with { type: "json" };
import leaderList from './jsonSeed/leader.json' with { type : "json"};
import teacherList from './jsonSeed/teacher.json' with { type: "json"};
import teacherNoClassList from './jsonSeed/teacherNoClass.json' with { type: "json"};

// Academic-Term
import termList from './jsonSeed/academicterm.json' with { type : "json"};
// Classroom
import classroomTypeList from './jsonSeed/classroomType.json' with { type: "json"};
import classroomList from './jsonSeed/classroom.json' with { type: "json"};
import classroomMemberList from './jsonSeed/classroomMemeber.json' with { type: "json"};
// Department
import departmentList from './jsonSeed/department.json' with { type: "json" };
// Suject
import subjectTypeList from './jsonSeed/subjectType.json' with {type : "json"};
import subjectList from './jsonSeed/subject.json' with { type: "json" };
// attendanceMethod
import attendenceMethodList from './jsonSeed/attendanceMethods.json' with { type: "json"};
// activityType
import activityTypeList from './jsonSeed/activityType.json' with { type: "json"};

async function  main() {
    try{
        //Admin
        const adminCreate = await db.admin.create({
            data:{
                name: 'admin test',
                password: await hashPassword("12345678"),
                username: 'admin01pp',
                email: 'admin',
                tel: '0651088956',
            }
        })

        //AcademicTerm
        const academicterm = await db.academicTerms.createMany({
            data:termList.map((term) => {
                return {
                    ...term,
                    termStart: DateTime.fromISO(term.termStart.toString(), {zone: 'UTC'}),
                    termEnd: DateTime.fromISO(term.termEnd.toString(), {zone: 'UTC'})
                }
            })
        });

        //Create Department Base
        const departmentCreate = await db.department.createMany({
            data:departmentList
        });
        //Create ClassroomType Base
        const classroomTypeCreate = await db.classroomType.createMany({
            data:classroomTypeList
        });
        //Create Classroom Base
        const classroomCreate = await db.classrooms.createMany({
            data:classroomList
        });
        //Create Student Base
        const studentCreate = await db.student.createMany({
            data:studentList
        });
        //Crate ClassroomMember
        const classroomMemberCreate = await db.classroomMember.createMany({
            data:classroomMemberList
        });
        // Create Teacher Base
        const teacherData = await Promise.all(teacherList.map(async (teacher) => {
                const teacherObject = teacher;
                return {
                    ...teacherObject, "password" : await hashPassword(teacherObject.password)
                }
            })
        );
        const teacherCreate =  await db.teacher.createMany({
            data: teacherData
        });

        //Create TeacherNo class base for subject
        const teacherNoClassData = await Promise.all(teacherNoClassList.map(async (teacher) => {
            const teacherObject = teacher;
                return {
                    ...teacherObject, "password" : await hashPassword(teacherObject.password)
                }
            })
        );
        const teacherNoClassCreate =  await db.teacher.createMany({
            data: teacherNoClassData
        });
        //Crate subuject Type
        const subejctTypeCreate = await db.subjectType.createMany({
            data:subjectTypeList
        });
        //Crate subuject
        const subjectCreate = await db.subject.createMany({
            data:subjectList
        });
        // Crate Attendence Method
        const attendanceMethodCreate = await db.attendanceMethod.createMany({
            data:attendenceMethodList
        });
        //Create ActivityType
        const activityTypeCreate = await db.activityType.createMany({
            data:activityTypeList
        });
    }catch(error){
        throw error;
    }
    
}

main().catch((err) => {
    console.error("Error on generation Seed: " +err);
});

