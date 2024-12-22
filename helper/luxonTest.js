import { DateTime } from "luxon";
import db from '../prisma/client.js';

// const dt = DateTime.now();

// 2017-05-15T08:30:00

// const time = "2024-12-22T02:00:00";
// const timeInBangkok = DateTime.fromISO(time, { zone: 'UTC' });
// console.log(timeInBangkok.toString());

// const test =  async () => {
//     try{
//         const stydinTime = await db.studingTime.findFirst({
//             where:{
//                 // studyTimeId: "15b8901c-c81a-4492-932f-8f035cb9c6e4",
//                 studingTimeDate: timeInBangkok
//             },
//         })
//         console.log(stydinTime)
//     }catch(err){
//         console.error(err)
//     }
// }

// test()

const attendanceHistorySearchByTermAndSubjectId = async () => {
    // const classroomId = req.params.classroomId;
    const classroomId = '7eb6915b-da21-4c6d-9060-207377cbceb2'
    try{
        const timetableId = await db.timetable.findMany({
            where: {
                classId: classroomId,
                subId: 'f3dc16af-db2c-4c3d-a773-9f6723741a4e',
            }
        })

        const timetableIdArray = timetableId.map((value) => 
            value.timetableId
        )

        const studingTime = await db.studingTime.findMany({
            where :{ 
                timetableId:{
                    in: timetableIdArray
                }
            },
            orderBy: {
                studingTimeDate:'asc'
            },
            select : {
                studyTimeId:true,
                timetable:true,
                attendance:true
            }
        })
        console.log(studingTime)

        // console.log(timetableId)
    }catch(err) {
        console.error(err);
    };
};

attendanceHistorySearchByTermAndSubjectId()

// console.log(dt.set({hour : 23,}))