import db from "../prisma/client.js";
import {
  formatTime,
  formatDateYYYYMMDD,
  daybetween,
} from "../helper/helper.js";
import { DateTime } from "luxon";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getFullCalendarStudyTime = async (req, res) => {
  const classroomId = req.params.classroomId;
  try {
    const timetables = await db.timetable.findMany({
      where: {
        classId: classroomId,
      },
      select: {
        timetableId: true,
      },
    });
    //console.log(timetables);  // Ex. [{ timetableId: 'd4639e55-00f8-4e6f-8a8c-2256c2e045db' }, ...]
    const studyTimes = await db.studingTime.findMany({
      where: {
        timetableId: {
          in: timetables.map((timetable) => timetable.timetableId),
        },
      },
      orderBy: {
        studingTimeDate: "asc",
      },
      select: {
        timetable: {
          select: {
            subject: {
              select: {
                subCode: true,
                subNameThai: true,
                subNameEng: true,
              },
            },
          },
        },
        studingTimeDate: true,
      },
    });
    const fullCalendarEventFormat = studyTimes.map((studytime) => {
      // 1. แปลงอ็อบเจกต์ Date ให้เป็น String โดยไม่ให้เปลี่ยนโซนเวลา
      //    หรือถ้าข้อมูลที่ส่งมาเป็น String อยู่แล้วก็ใช้ได้เลย
      const dateString = studytime.studingTimeDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // 2. ใช้ .fromFormat() และระบุโซนเวลาท้องถิ่น (zone)
      const startDateTime = DateTime.fromFormat(
        dateString,
        "yyyy-MM-dd HH:mm:ss",
        { zone: zone },
      );

      const endDateTime = startDateTime.plus({ minutes: 50 });

      return {
        title: `${studytime.timetable.subject.subCode}-${studytime.timetable.subject.subNameThai}`,
        start: startDateTime,
        end: endDateTime,
        // color: "#FFD700",
      };
    });
    // console.log(fullCalendarEventFormat);
    res.json(fullCalendarEventFormat);
  } catch (err) {
    console.error(err);
  }
};

export const getStuydingTimeById = async (req, res) => {
  const studingTimeId = req.params.UUID;
  try {
    const studingTime = await db.studingTime.findUnique({
      where: {
        studyTimeId: studingTimeId,
      },
      include: {
        timetable: {
          include: {
            classroom: {
              include: {
                classroomMembers: {
                  include: {
                    student: true,
                  },
                },
              },
            },
            subject: true,
          },
        },
        attendance: {
          include: {
            student: true,
            attMethod: true,
          },
        },
      },
    });
    res.json(studingTime);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการเรียน" });
  }
};
