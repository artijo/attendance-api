import * as svc from "../services/activityService.js";

export const getAllActivitiesByType = async (req, res) => {
  try { res.json(await svc.getAllActivitiesByType(req.params.type)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getActivity = async (req, res) => {
  try { res.json(await svc.getActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityType = async (req, res) => {
  try { res.json(await svc.getActivityType()); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const createActivity = async (req, res) => {
  try { res.json(await svc.createActivity(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const editActivity = async (req, res) => {
  try { res.json(await svc.editActivity(req.params.uuid, req.body)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getActivityByTeacher = async (req, res) => {
  try { res.json(await svc.getActivityByTeacher(req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const paticipatedActivityByteacher = async (req, res) => {
  try { res.json(await svc.paticipatedActivityByteacher(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const abstactActivityClassroom = async (req, res) => {
  try { res.json(await svc.abstactActivityClassroom(req.params.activityId)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const abstactActivityFilterByRoom = async (req, res) => {
  try { res.json(await svc.abstactActivityFilterByRoom(req.params.activityId, req.params.classId)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const generateLinkActivityForQR = async (req, res) => {
  try { res.json(await svc.generateLinkActivityForQR(req.body.actId, req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const saveActivityByStudentWithQR = async (req, res) => {
  try { res.json(await svc.saveActivityByStudentWithQR(req.user.id, req.body.token)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityByLeader = async (req, res) => {
  try { res.json(await svc.getActivityByLeader(req.user.id)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const paticipatedActivityByLeader = async (req, res) => {
  try { res.json(await svc.paticipatedActivityByLeader(req.body)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const getActivityStudent = async (req, res) => {
  const studnetId = req.user.id;
  if (studnetId) {
    try {
      const studentClassroomMember = await db.classroomMember.findMany({
        where: {
          stdId: studnetId,
          deletedAt: null,
        },
        include: {
          classroom: {
            include: {
              term: true,
            },
          },
        },
      });
      // console.log(studentClassroomMember);
      const arrayOfClassID = studentClassroomMember.map(
        (stdclassMemeber) => stdclassMemeber.classId,
      );
      if (studentClassroomMember.length < 0) {
        console.error("นักเรียนคนนี้ไม่มีห้องที่อยู่");
        return res.status(500).json({ message: "Internal server error" });
      }
      const terms = studentClassroomMember
        .reduce((accumulator, currentValue) => {
          const term = currentValue.classroom.term;
          if (!accumulator.includes(term)) {
            accumulator.push(term);
          }
          return accumulator;
        }, [])
        .sort((a, b) => a.termStart - b.termStart);
      if (terms.length < 0) {
        console.error("ไม่มีเทอม");
        return res.status(500).json({ message: "Internal server error" });
      }
      const firstTermStartDate = DateTime.fromJSDate(
        terms[0].termStart,
      ).setZone("UTC");
      const lastTermStartDate = DateTime.fromJSDate(
        terms[terms.length - 1].termEnd,
      ).setZone("UTC");
      const activity = await db.activity.findMany({
        where: {
          AND: [
            { actDate: { gte: firstTermStartDate } },
            { actDateEnd: { lte: lastTermStartDate } },
            { deletedAt: null },
          ],
        },
        include: {
          classroom: {
            where: {
              deletedAt: null,
            },
          },
          activityType: true,
        },
      });
      const filterActivity = activity.reduce((accumulator, item) => {
        if (item.classroom.length > 0) {
          item.classroom.map((classCanJoin) => {
            if (arrayOfClassID.includes(classCanJoin.classId)) {
              accumulator.push(item);
            }
          });
        } else {
          accumulator.push(item);
        }
        return accumulator;
      }, []);
      return res.status(200).json(filterActivity);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    console.error(error);
    return res.status(400).json({ message: "Bad requset" });
  }
};
export const activityCheckIn = async (req, res) => {
  try { res.json(await svc.activityCheckIn(req.user.id, req.body.actId)); } catch (e) { console.error(e); res.status(e.statusCode || 500).json({ message: e.message }); }
};
export const isActivityThisTimeCheckIn = async (req, res) => {
  const { activityId } = req.params;
  const studentId = req.user.id;
  const dtNowStartDay = DateTime.now().setZone("Asia/Bangkok").startOf("day");
  const dtNowEndDay = DateTime.now().setZone("Asia/Bangkok").endOf("day");
  console.log(dtNowEndDay.toUTC().toString());
  if (activityId && studentId) {
    try {
      const isActivityPaticipate = await db.activityParticipate.findFirst({
        where: {
          AND: [
            { actId: activityId },
            { stdId: studentId },
            { deletedAt: null },
            {
              joinTimestamp: {
                gte: dtNowStartDay,
                lte: dtNowEndDay,
              },
            },
          ],
        },
      });
      if (isActivityPaticipate) {
        return res.status(200).json({ isFound: true });
      } else {
        return res.status(200).json({ isFound: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    console.error("Bad reqsuet");
    return res.status(400).json({ message: "Bad requset" });
  }
};
export const activityHistoryStudent = async (req, res) => {
  try { res.json(await svc.activityHistoryStudent(req.user.id)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const softDeleteActivity = async (req, res) => {
  try { res.json(await svc.softDeleteActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const getsoftDeletedActivity = async (req, res) => {
  try { res.json(await svc.getSoftDeletedActivities()); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
export const restoreSoftDeletedActivity = async (req, res) => {
  try { res.json(await svc.restoreSoftDeletedActivity(req.params.uuid)); } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
