import { DateTime, Zone } from "luxon";
import db from "../prisma/client.js";
import { CheckDateBetween, daybetween } from "../helper/helper.js";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const getAllAcademicTerms = async (req, res) => {
  try {
    const academicTerms = await db.academicTerms.findMany({
      orderBy: [{ academicYear: "asc" }, { semester: "asc" }],
    });
    res.status(200).json(academicTerms);
  } catch (error) {
    res.status(501).json({ message: "มีบางอย่างผิดพลาดบน Server" });
    console.error(error);
  }
};

export const getTermDateBetweenFilterHolidays = async (req, res) => {
  const termId = req.params.termId;
  if (termId) {
    try {
      const term = await db.academicTerms.findUnique({
        where: {
          termId: termId,
        },
      });

      const holidays = await db.holiday.findMany({
        where: {
          termId: termId,
        },
        orderBy: {
          startHolidayDate: "asc",
        },
      });

      const holidayListDate = holidays.map((holiday) => {
        // สร้าง DateTime จากวันที่ในฐานข้อมูล และระบุ Timezone ทันที
        const timezoneformat = DateTime.fromJSDate(holiday.startHolidayDate, {
          zone: zone,
        });
        const holidayDay = timezoneformat.toISODate();
        return holidayDay;
      });

      // สร้าง DateTime โดยระบุ Timezone ให้ชัดเจน
      const termStart = DateTime.fromJSDate(term.termStart, {
        zone: zone,
      }).toISODate();
      const termEnd = DateTime.fromJSDate(term.termEnd, {
        zone: zone,
      }).toISODate();

      // ฟังก์ชัน daybetween() ต้องส่งข้อมูลวันที่ที่อยู่ในรูปแบบ 'yyyy-MM-dd'
      const termDateBetween = daybetween(termStart, termEnd)
        .filter((date) => {
          // สร้าง DateTime object ด้วยวันที่และ Timezone ที่ถูกต้องทันที
          const checkSatAndSun = DateTime.fromISO(date, { zone: zone }).weekday;
          return checkSatAndSun !== 6 && checkSatAndSun !== 7;
        })
        .filter((date) => {
          return !holidayListDate.includes(date);
        });

      return res.status(200).send(termDateBetween);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "เกิดข้อผิดพลาดบางอย่างที่ server" });
    }
  } else {
    return res.status(400).send({ message: "bad requset" });
  }
};

export const getOneAcademicTerm = async (req, res) => {
  const termId = req.params.termId;
  if (termId) {
    try {
      const academicTerm = await db.academicTerms.findFirst({
        where: {
          termId: String(termId),
        },
        include: {
          holiday: true,
        },
      });
      res.json(academicTerm);
    } catch (error) {
      console.error(error);
    }
  }
};

export const createTerm = async (req, res) => {
  const body = req.body;
  const acadamicyear = parseInt(body.academicYear) - 543;
  const semester = parseInt(body.semester);
  const termStart = DateTime.fromISO(`${body.termStart}T00:00:00`).setZone(
    zone,
  );
  const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00`).setZone(zone);
  // console.log(termStart);
  // console.log(termEnd);
  if (acadamicyear && semester && termStart && termEnd) {
    try {
      const isexistacademicterm = await db.academicTerms.findFirst({
        where: {
          academicYear: acadamicyear,
          semester: semester,
        },
      });
      if (isexistacademicterm) {
        return res.status(400).json({
          message:
            "ไม่สามารถสร้างเทอมปีการศึกษาได้เนื่องจากมีปีการศึกษาและเทอมนี้อยู่แล้ว",
        });
      }
      // เช็คว่ามีเทอมที่มีวันที่ทับซ้อนกันหรือไม่
      const minimunDate = await db.academicTerms.findFirst({
        orderBy: {
          termStart: "asc",
        },
      });
      const maxDate = await db.academicTerms.findFirst({
        orderBy: {
          termEnd: "desc",
        },
      });
      if (minimunDate && maxDate) {
        const isTermExist = CheckDateBetween(
          minimunDate.termStart,
          maxDate.termEnd,
          termStart,
          termEnd,
        );
        if (isTermExist) {
          return res.status(400).json({
            message:
              "ไม่สามารถสร้างเทอมปีการศึกษาได้เนื่องจากมีระหว่างวันที่มีอยู่ในฐานข้อมูลแล้ว",
          });
        }
      }
      // const isTermExist = CheckDateBetween(minimunDate.termStart, maxDate.termEnd, termStart, termEnd);
      // if(isTermExist){
      //     return res.status(400).json({message:"ไม่สามารถสร้างเทอมปีการศึกษาได้เนื่องจากมีระหว่างวันที่มีอยู่ในฐานข้อมูลแล้ว"});
      // }
      await db.academicTerms.create({
        data: {
          academicYear: acadamicyear,
          semester: semester,
          termStart: termStart,
          termEnd: termEnd,
        },
      });
      res.status(200).json({ message: "สร้างเทอมปีการศึกษาสำเร็จ" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error: เกิดข้อผิดพลาดในการสร้างเทอมปีการศึกษา" });
    }
  } else {
    res.status(400).json({ message: "กรุณากรอกข้อมูลให้ถูกต้องหรือครบถ้วน" });
  }
};

export const updateTerm = async (req, res) => {
  const body = req.body;
  const termId = body.termId;
  const acadamicyear = parseInt(body.academicYear);
  const semester = parseInt(body.semester);
  const termStart = DateTime.fromISO(`${body.termStart}T00:00:00`).setZone(
    zone,
  );
  const termEnd = DateTime.fromISO(`${body.termEnd}T00:00:00`).setZone(zone);
  if (body) {
    try {
      await db.academicTerms.update({
        where: {
          termId: termId,
        },
        data: {
          academicYear: acadamicyear,
          semester: semester,
          termStart: termStart,
          termEnd: termEnd,
        },
      });
      res.status(200).json({ message: "แก้ไขปีการศึกษาสำเร็จ" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error: เกิดข้อผิดพลาดในการแก้ไขเทอมปีการศึกษา" });
    }
  } else {
    res.status(400).json({ message: "กรุณากรอกข้อมูลให้ถูกต้องหรือครบถ้วน" });
  }
};

export const deleteTerm = async (req, res) => {
  const termId = req.params.termId;
  if (termId) {
    try {
      const academicTerm = await db.academicTerms.delete({
        where: {
          termId: String(termId),
        },
      });
      res.status(200).json({
        message: `ลบ ปีการศึกษา${academicTerm.academicYear} เทอม ${academicTerm.semester} สำเร็จ`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "ไม่สามารถลบปีการศึกษาเทอมได้" });
    }
  }
};

export const getTermByStudent = async (req, res) => {
  const studentId = req.user.id;
  if (studentId) {
    try {
      const classRoomMember = await db.classroomMember.findMany({
        where: {
          stdId: studentId,
        },
        include: {
          classroom: {
            include: {
              term: {
                include: {
                  holiday: true,
                },
              },
            },
          },
        },
      });
      const termList = classRoomMember
        .map((classroomMember) => classroomMember.classroom.term)
        .sort((a, b) => a.termStart - b.termStart);
      res.status(200).json(termList);
    } catch (error) {
      res.status(500).json({ message: "something happen!" });
    }
  } else {
    return res.status(400).json({ message: "id not found" });
  }
};
