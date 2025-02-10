import db from './client.js';


async function getStudingTime(classroomId){ // after you insert the data, in studingTime already
    const studyTime = await db.studingTime.findMany({
        where: {
            timetable:{
                classId:classroomId
            }
        },
        orderBy:{
            studingTimeDate: 'asc'
        }
    });
    const studyTimeIdArray = studyTime.map((studyTime) => studyTime.studyTimeId);
    return studyTimeIdArray;
}

async function getStudent(classroomId){
    const student = await db.classroomMember.findMany({
        where:{
            classId:classroomId
        },
        select:{
            stdId:true,
        }
    });
    const studentIdArray = student.map((student) => student.stdId);
    return studentIdArray;
}

//this is for test our systems


// ถ้าจะใช้ให้เพิ่ม timetable ก่อนค่อย insertAttndence
async function insertAttendence() {
    const classroomId = "ceeb4319-c4bf-4dce-8299-daa237c95472";
    const attMethodId = "27756861-4d56-4d0a-8bcf-ec57b9f5beec";
    const teacherId = "442db621-1ffd-4fc9-a279-d5ab2d48a509";
    const leaderId = "c126288a-6d73-4b4b-b4de-e179d196b8f5";
    const studentIdArray = await getStudent(classroomId);
    const studyTimeIdArray = await getStudingTime(classroomId);
    for(let studytimeindex = 0; studytimeindex < studyTimeIdArray.length; studytimeindex++){
        for(let studentindex = 0; studentindex < studentIdArray.length; studentindex++){
            await db.attendance.create({
                data:{
                    latitute:null,
                    longitute:null,
                    note:"test",
                    operatedBy: "Admin test",
                    tchId: teacherId,
                    leaderId: leaderId,
                    stdId:studentIdArray[studentindex],
                    studingTimeId:studyTimeIdArray[studytimeindex],
                    attTimestamp:new Date(),
                    attStatus:"PRESENT",
                    attMethodId:attMethodId,
                }
            });
        }
    }
}

insertAttendence();