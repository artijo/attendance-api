import { daybetween, formatDayOfWeeks } from "../helper/helper.js";
import db from "../prisma/client.js";
import { DateTime } from "luxon";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export const createTimetableByAddSubject = async (req, res) => {
  const { classroom, timetable, schedule, weekday } = req.body;
  // console.log(schedule);
  if (classroom && timetable && schedule && weekday) {
    try {
      const findPeriod = await db.timetable.findFirst({
        where: {
          AND: [
            { classId: classroom.classId },
            { timeStart: schedule.startDatabaseFormat },
            { timeEnd: schedule.endDatabaseFormat },
            { dayOfWeek: Number(timetable.dayOfWeek) },
          ],
        },
      });

      if (findPeriod) {
        const updateTimetableOnSubject = await db.timetable.update({
          where: {
            timetableId: findPeriod.timetableId,
          },
          data: {
            subId: timetable.subject.subId,
          },
        });
        return res.status(200).json({ message: "update successful" });
      } else {
        const subjectOnTimetable = await db.timetable.findMany({
          where: {
            AND: [
              { subId: timetable.subject.subId },
              { classroom: { termId: classroom.termId } },
            ],
          },
          include: {
            subject: true,
            classroom: true,
          },
        });
        const subjectExistsInPeriod = subjectOnTimetable.find(
          ({ timeStart, timeEnd, dayOfWeek, subId }) =>
            String(timeStart) === schedule.startDatabaseFormat &&
            String(timeEnd) === schedule.endDatabaseFormat &&
            dayOfWeek === Number(weekday),
        );
        if (subjectExistsInPeriod != undefined) {
          // console.log('400 kub');
          return res.status(400).json({
            message: `ไม่สามารถสร้างวิชานี้ได้เนื่องจาก ${subjectExistsInPeriod.subject.subNameThai} อยู่ในคาบวัน ${formatDayOfWeeks(subjectExistsInPeriod.dayOfWeek)} คาบเวลา ${schedule.timetableformate} ห้องม.${subjectExistsInPeriod.classroom.classLevel}/${subjectExistsInPeriod.classroom.classRoom}`,
          });
        }
        // console.log(subjectExistsInPeriod);
        const createTimetable = await db.timetable.create({
          data: {
            subId: timetable.subject.subId,
            classId: classroom.classId,
            timeStart: timetable.timeStart,
            timeEnd: timetable.timeEnd,
            timeLate: timetable.timeLate,
            dayOfWeek: Number(timetable.dayOfWeek),
          },
        });

        const holiday = await db.holiday.findMany({
          where: {
            termId: classroom.term.termId,
          },
        });

        const holidayListDate = holiday.map((holiday) => {
          const timezoneformat = DateTime.fromJSDate(
            holiday.startHolidayDate,
          ).setZone(zone);
          const holidayDay = timezoneformat.toISODate();
          return holidayDay;
        });

        const termDateBetween = daybetween(
          classroom.term.termStart,
          classroom.term.termEnd,
        )
          .filter((date) => {
            const checkSatAndSun = DateTime.fromISO(
              `${date}T${createTimetable.timeStart}`,
            ).setZone(zone).weekday;
            // console.log(checkSatAndSun);
            return checkSatAndSun != 6 && checkSatAndSun != 7;
            // console.log(checkSatAndSun);
          })
          .filter((date) => {
            // const checkSatAndSun = DateTime.fromISO(`${date}T${timetable.timeStart}`).setZone(zone).day;
            return !holidayListDate.includes(date);
          });
        // console.log(termDateBetween);
        //  // เรียก daybetween เพื่อดูระหว่างวันไหนของเทอม และ filter วันเสาร์อาทิตย์ออกหลังจากนั้น filter วันหยุดต่อ
        for (const date of termDateBetween) {
          const dateformat = DateTime.fromISO(
            `${date}T${createTimetable.timeStart}`,
          ).setZone(zone);
          if (Number(dateformat.weekday) === Number(timetable.dayOfWeek)) {
            await db.studingTime.create({
              data: {
                timetable: {
                  connect: {
                    timetableId: createTimetable.timetableId,
                  },
                },
                studingTimeDate: dateformat,
              },
            });
          }
        }
        const findStudingTime = await db.studingTime.findMany({
          where: {
            timetable: {
              classId: classroom.classId,
            },
          },
        });
        // console.log(findStudingTime);
        return res.status(200).json({ message: "create successful" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};

export const createTimetableBySwitchPeriod = async (req, res) => {
  const { classroom, timetable, schedule, weekday } = req.body;
  if (timetable) {
    try {
      const subjectOnTimetable = await db.timetable.findMany({
        where: {
          AND: [
            { subId: timetable.subId },
            { classroom: { termId: classroom.termId } },
          ],
        },
        include: {
          subject: true,
          classroom: true,
        },
      });
      const subjectExistsInPeriod = subjectOnTimetable.find(
        ({ timeStart, timeEnd, dayOfWeek, subId }) =>
          String(timeStart) === schedule.startDatabaseFormat &&
          String(timeEnd) === schedule.endDatabaseFormat &&
          dayOfWeek === Number(timetable.dayOfWeek),
      );
      if (subjectExistsInPeriod != undefined)
        return res.status(400).json({
          message: `ไม่สามารถสร้างวิชานี้ได้เนื่องจาก ${subjectExistsInPeriod.subject.subNameThai} อยู่ในคาบวัน ${formatDayOfWeeks(subjectExistsInPeriod.dayOfWeek)} คาบเวลา ${schedule.timetableformate} ห้องม.${subjectExistsInPeriod.classroom.classLevel}/${subjectExistsInPeriod.classroom.classRoom}`,
        });

      const swtichPeriod = await db.timetable.update({
        where: {
          timetableId: timetable.timetableId,
        },
        data: {
          subId: timetable.subId,
          classId: timetable.classId,
          timeStart: timetable.timeStart,
          timeEnd: timetable.timeEnd,
          timeLate: timetable.timeLate,
          dayOfWeek: timetable.dayOfWeek,
        },
      });

      const studingTimeOnPeriod = await db.studingTime.findMany({
        where: {
          timetableId: timetable.timetableId,
        },
      });

      if (studingTimeOnPeriod.length > 0) {
        studingTimeOnPeriod.forEach(async (studyTime) => {
          // .setZone(process.env.TIME_ZONE)
          const newTimeformat = DateTime.fromISO(
            `${studyTime.studingTimeDate.toISOString().split("T")[0]}T${timetable.timeStart}`,
          )
            .set({ weekday: weekday })
            .setZone(process.env.TIME_ZONE);
          // console.log(newTimeformat);
          const updateStdyingTime = await db.studingTime.update({
            where: {
              studyTimeId: studyTime.studyTimeId,
            },
            data: {
              studingTimeDate: newTimeformat,
            },
          });
          // console.log(updateStdyingTime);
        });
      }
      return res.status(200).json({ message: "create successful" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};

export const createTimetableBySwitchSubjectAndSubject = async (req, res) => {
  const { firstTimetable, secondTimetable } = req.body;
  if (firstTimetable && secondTimetable) {
    try {
      async function checkIsSubjectIsExitTime(firstTimetable, secondTimetable) {
        const subjectOnTimetable = await db.timetable.findMany({
          where: {
            AND: [
              { subId: firstTimetable.subId },
              { classroom: { termId: firstTimetable.classroom.termId } },
            ],
          },
          include: {
            subject: true,
            classroom: true,
          },
        });

        // console.log(subjectExistsInPeriod.dayOfWeek)

        const subjectExistsInPeriod = subjectOnTimetable.find(
          ({ timeStart, timeEnd, dayOfWeek }) =>
            String(timeStart) === secondTimetable.timeStart &&
            String(timeEnd) === secondTimetable.timeEnd &&
            dayOfWeek === Number(secondTimetable.dayOfWeek),
        );
        // console.log(subjectExistsInPeriod);
        if (subjectExistsInPeriod != undefined) {
          // console.log(subjectExistsInPeriod);
          return true;
        } else {
          // console.log(subjectExistsInPeriod);
          return false;
        }
      }

      if (
        (await checkIsSubjectIsExitTime(firstTimetable, secondTimetable)) ===
        true
      ) {
        // console.log('if 1')
        return res.status(400).json({
          message: `ไม่สามารถสลับวิชานี้ได้เนื่องจากมีวิชาที่คาบซ่ำกันอยู่`,
        });
      }

      if (
        (await checkIsSubjectIsExitTime(secondTimetable, firstTimetable)) ===
        true
      ) {
        // console.log('if 2')
        return res.status(400).json({
          message: `ไม่สามารถสลับวิชานี้ได้เนื่องจากมีวิชาที่คาบซ่ำกันอยู่`,
        });
      }

      const swtichSubjectFirstTimetable = await db.timetable.update({
        where: {
          timetableId: firstTimetable.timetableId,
        },
        data: {
          subId: secondTimetable.subId,
        },
      });

      const swtichSubjectSecondTimetable = await db.timetable.update({
        where: {
          timetableId: secondTimetable.timetableId,
        },
        data: {
          subId: firstTimetable.subId,
        },
      });
      return res.status(200).json({ message: "create successful" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};

export const createTimetable = async (req, res) => {
  const { subject, timelate, schedule, classroom, day } = req.body;
  // console.log(periodtime);
  // console.log('work');
  if (subject && timelate && schedule && classroom && day) {
    try {
      const subjectOnTimetable = await db.timetable.findMany({
        where: {
          AND: [
            {
              subId: subject.subId,
            },
            {
              classroom: {
                termId: classroom.termId,
              },
            },
          ],
        },
        include: {
          subject: true,
          classroom: true,
        },
      });
      const subjectExistsInPeriod = subjectOnTimetable.find(
        ({ timeStart, timeEnd, dayOfWeek, subId }) =>
          String(timeStart) === schedule.startDatabaseFormat &&
          String(timeEnd) === schedule.endDatabaseFormat &&
          dayOfWeek === Number(day),
      );
      if (subjectExistsInPeriod != undefined)
        return res.status(400).json({
          message: `ไม่สามารถสร้างวิชานี้ได้เนื่องจาก ${subjectExistsInPeriod.subject.subNameThai} อยู่ในคาบวัน ${formatDayOfWeeks(subjectExistsInPeriod.dayOfWeek)} คาบเวลา ${periodtime.timetableformate} ห้องม.${subjectExistsInPeriod.classroom.classLevel}/${subjectExistsInPeriod.classroom.classRoom}`,
        });
      const timelateDatetime = DateTime.fromISO(schedule.startDatabaseFormat)
        .setZone(zone)
        .plus({ minutes: timelate });
      const timelateDatabaseFormat = timelateDatetime.toFormat("HH:mm:ss");
      const timetable = await db.timetable.create({
        data: {
          subId: subject.subId,
          classId: classroom.classId,
          timeStart: schedule.startDatabaseFormat,
          timeEnd: schedule.endDatabaseFormat,
          timeLate: timelateDatabaseFormat,
          dayOfWeek: Number(day),
        },
      });

      const holiday = await db.holiday.findMany({
        where: {
          termId: classroom.term.termId,
        },
      });

      const holidayListDate = holiday.map((holiday) => {
        const timezoneformat = DateTime.fromJSDate(
          holiday.startHolidayDate,
        ).setZone(zone);
        const holidayDay = timezoneformat.toISODate();
        // console.log(holidayDay);
        return holidayDay;
      });

      const termDateBetween = daybetween(
        classroom.term.termStart,
        classroom.term.termEnd,
      )
        .filter((date) => {
          const checkSatAndSun = DateTime.fromISO(
            `${date}T${timetable.timeStart}`,
          ).setZone(zone).weekday;
          // console.log(checkSatAndSun);
          return checkSatAndSun != 6 && checkSatAndSun != 7;
          // console.log(checkSatAndSun);
        })
        .filter((date) => {
          // const checkSatAndSun = DateTime.fromISO(`${date}T${timetable.timeStart}`).setZone(zone).day;
          return !holidayListDate.includes(date);
        });
      //  // เรียก daybetween เพื่อดูระหว่างวันไหนของเทอม และ filter วันเสาร์อาทิตย์ออกหลังจากนั้น filter วันหยุดต่อ
      for (const date of termDateBetween) {
        const dateformat = DateTime.fromISO(
          `${date}T${timetable.timeStart}`,
        ).setZone(zone);
        if (Number(dateformat.weekday) === Number(day)) {
          await db.studingTime.create({
            data: {
              timetable: {
                connect: {
                  timetableId: timetable.timetableId,
                },
              },
              studingTimeDate: dateformat,
            },
          });
        }
      }

      return res.status(200).json({ message: "สร้างสำเร็จ" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในขณะสร้างคาบตารางเรียน" });
    }
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};

export const editTimelateTimetable = async (req, res) => {
  const { timetable, lateTime } = req.body;

  if (lateTime && timetable) {
    const updateTimetableLate = await db.timetable.update({
      where: {
        timetableId: timetable.timetableId,
      },
      data: {
        timeLate: String(lateTime),
      },
    });

    return res.status(200).json({ message: "สร้างสำเร็จ" });
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};

export const getTimeTableByRoom = async (req, res) => {
  const classId = req.query.classroomid;
  if (classId) {
    try {
      const timetable = await db.timetable.findMany({
        where: {
          classId: classId,
        },
        orderBy: [{ dayOfWeek: "asc" }, { timeStart: "asc" }],
        select: {
          timetableId: true,
          dayOfWeek: true,
          timeStart: true,
          timeEnd: true,
          timeLate: true,
          subId: true,
          classId: true,
          classroom: {
            select: {
              classId: true,
              classLevel: true,
              classRoom: true,
              term: {
                select: {
                  semester: true,
                  academicYear: true,
                },
              },
              leader: {
                select: {
                  ldrId: true,
                  student: {
                    select: {
                      fName: true,
                      lName: true,
                    },
                  },
                },
              },
              classroomType: {
                select: {
                  classTypeId: true,
                  classTypeNameEng: true,
                  classTypeNameThai: true,
                },
              },
            },
          },
          subject: {
            select: {
              subId: true,
              subNameEng: true,
              subNameThai: true,
              subCode: true,
              subCredit: true,
              teacher: {
                select: {
                  tchId: true,
                  fName: true,
                  lName: true,
                },
              },
            },
          },
        },
      });

      const dayOfWeek = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
      };
      const arrayOfDayOfWeek = Object.keys(dayOfWeek);
      arrayOfDayOfWeek.forEach((objectKey) => {
        timetable.forEach((subjecttimetable) => {
          if (Number(objectKey) === Number(subjecttimetable.dayOfWeek)) {
            dayOfWeek[objectKey].push(subjecttimetable);
          }
        });
      });
      res.json(dayOfWeek);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "error qurey timetable." });
    }
  } else {
    res.status(400).json({ error: "Invalid input data." });
  }
};

export const deleteTimetable = async (req, res) => {
  const timetableId = req.params.timetableId;
  // console.log(timetableId);
  if (timetableId) {
    try {
      const studyingTime = await db.studingTime.findMany({
        where: {
          timetableId: timetableId,
        },
      });
      if (studyingTime.length > 0) {
        const studyTimeId = studyingTime.map((item) => item.studyTimeId);

        const leaveRequest = await db.leaveRequestStudingTime.deleteMany({
          where: {
            studyTimeId: {
              in: studyTimeId,
            },
          },
        });

        const attendance = await db.attendance.deleteMany({
          where: {
            studingTimeId: {
              in: studyTimeId,
            },
          },
        });
        const studyingTimeDelete = await db.studingTime.deleteMany({
          where: {
            timetableId: timetableId,
          },
        });
      }
      const timetable = await db.timetable.delete({
        where: {
          timetableId: timetableId,
        },
      });
      res.json("delete successfully!");
    } catch (err) {
      console.error(err);
    }
  }
};

export const getSubjectTimetable = async (req, res) => {
  const classroomId = req.params.classroomId;
  if (classroomId) {
    try {
      const timetables = await db.timetable.findMany({
        where: {
          classId: classroomId,
        },
        orderBy: [{ dayOfWeek: "asc" }, { timeStart: "asc" }],
        select: {
          classroom: {
            select: {
              classId: true,
            },
          },
          subject: {
            select: {
              subId: true,
              subNameEng: true,
              subNameThai: true,
              subCode: true,
              subCredit: true,
              teacher: {
                select: {
                  tchId: true,
                  fName: true,
                  lName: true,
                },
              },
            },
          },
        },
      });
      const listSubject = timetables.map((item) => item.subject);
      const uniqueSubject = listSubject.filter(
        (value, index, self) =>
          self.findIndex((item) => item.subId === value.subId) === index,
      );
      // console.log([...uniqueSubject]);
      res.json(uniqueSubject);
    } catch (err) {
      console.error(err);
    }
  }
};

export const getTimeTable = async (req, res) => {
  // ใช้สำหรับการส่งข้อมูลตารางเรียนว่าวันนั้นเรียนวิชาอะไรบ้าง
  const classId = req.params.classroomId;
  const dayOfWeek = req.params.dayOfWeek;
  if (classId && dayOfWeek) {
    try {
      const timetables = await db.timetable.findMany({
        where: {
          AND: {
            classId: String(classId),
            dayOfWeek: Number(dayOfWeek),
          },
        },
        orderBy: {
          timeStart: "asc",
        },
      });
      const formatTime = (time) => {
        const dt = DateTime.now().setZone(zone);
        const utfString = `${dt.year}-${dt.month}-${dt.day}T${time}`;
        const timeInBangkok = DateTime.fromISO(utfString, { zone: "UTC" });
        return timeInBangkok;
      };

      let arrayOfTimeToAttendence = [];
      for (const timetable of timetables) {
        // console.log(`timetable Id is ${timetable.timetableId} and studinTime is ${formatTime(timetable.timeStart)}`);
        const st = await db.studingTime.findMany({
          where: {
            timetableId: timetable.timetableId,
            studingTimeDate: formatTime(timetable.timeStart),
          },
          orderBy: {
            studingTimeDate: "asc",
          },
          select: {
            studyTimeId: true,
            attendance: true,
            studingTimeDate: true,
            timetable: {
              select: {
                subject: {
                  select: {
                    subNameEng: true,
                    subNameThai: true,
                  },
                },
                timeStart: true,
                timeLate: true,
                timeEnd: true,
              },
            },
          },
        });
        // console.log(st)
        arrayOfTimeToAttendence.push(...st);
      }
      res.json(arrayOfTimeToAttendence);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log("pls enter params");
  }
};

export const getTimetableRoleStudent = async (req, res) => {
  const studentId = req.user.id;
  const dtNow = DateTime.now().setZone(zone);
  const dtNowString = dtNow.toString();
  const studyTimeStart = DateTime.fromISO(
    `${dtNowString.split("T")[0]}T08:40:00`,
  ).setZone("Asia/Bangkok");
  const studyTimeEnd = DateTime.fromISO(
    `${dtNowString.split("T")[0]}T15:30:00`,
  ).setZone("Asia/Bangkok");
  if (studentId != undefined) {
    try {

      const term = await db.academicTerms.findFirst({
        where: {
          termStart: { lte: dtNow.startOf('day') },
          termEnd: { gte: dtNow.startOf('day') },
        },
      });

      if (!term) {
        return res.status(500).json("Internal server-side error");
      }

      const classroomMember = await db.classroomMember.findFirst({
        where : {
          stdId: studentId,
          classroom: {
            termId: term.termId
          },
          deletedAt : null
        }
      });

      if (!classroomMember.classId) {
        return res.status(404).json({ message: "ไม่พบข้อมูลห้องเรียน" });
      }

      const timetable = await db.timetable.findMany({
        where: {
          classId: classroomMember.classId,
          dayOfWeek: dtNow.weekday,
        },
      });

      const studingTime = await db.studingTime.findMany({
        where: {
          timetableId: {
            in: timetable.map((item) => item.timetableId),
          },
          studingTimeDate: {
            gte: studyTimeStart,
            lte: studyTimeEnd,
          },
        },
        orderBy: {
          studingTimeDate: "asc",
        },
        include: {
          timetable: {
            include: {
              subject: {
                include: {
                  teacher: true,
                },
              },
              classroom: true,
            },
          },
        },
      });
      return res.status(200).json(studingTime);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  } else {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }
};
