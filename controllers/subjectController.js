import { DateTime } from "luxon";
import db from "../prisma/client.js";

export const createSubjectType = async (req, res) => {
  const body = req.body;
  if (body) {
    try {
      const createSubjectType = await db.subjectType.create({
        data: {
          subTypeNameThai: body.subTypeNameThai,
          subTypeNameEng: body.subTypeNameEng,
        },
      });
      res.json(createSubjectType);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
  }
};

export const selectSubjectType = async (req, res) => {
  const subjectType = req.params.UUID;
  if (subjectType) {
    try {
      const subjectId = db.subjectType.findFirstOrThrow({
        where: {
          subTypeId: subjectType,
        },
      });
      res.json(subjectId);
    } catch (err) {
      console.error(err);
      res.status(404).json({ message: "Subject type not found" });
    }
  }
};

export const getAllSubjectType = async (req, res) => {
  try {
    const subjectType = await db.subjectType.findMany({
      where: {
        deletedAt: null,
      },
    });
    res.json(subjectType);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch subject types", error: err.message });
  }
};

export const editSubjectType = async (req, res) => {
  const body = req.body;
  const { uuid } = req.params;
  if (body) {
    try {
      const subjectType = await db.subjectType.update({
        where: {
          subTypeId: uuid,
        },
        data: {
          subTypeNameThai: body.subTypeNameThai,
          subTypeNameEng: body.subTypeNameEng,
        },
      });
      res.json(subjectType);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
  }
};

export const deleteSubejectType = async (req, res) => {
  const subjectTypeId = req.params.uuid;
  if (subjectTypeId) {
    try {
      await db.subjectType.delete({
        where: {
          subTypeId: subjectTypeId,
        },
      });
      return res.json({ message: "Delete Success" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to delete subject type", error: err.message });
    }
  }
};

export const createSubject = async (req, res) => {
  const body = req.body;
  if (body) {
    try {
      const subjectCreate = await db.subject.create({
        data: {
          subCode: body.subCode,
          subNameThai: body.subNameThai,
          subNameEng: body.subNameEng,
          subCredit: parseFloat(body.subCredit),
          tchId: body.tchId,
          subTypeId: body.subTypeId,
        },
      });
      res.json(subjectCreate);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
  }
};

export const editSubject = async (req, res) => {
  const body = req.body;
  const { UUID } = req.params;
  if (body) {
    try {
      const subject = await db.subject.update({
        where: {
          subId: UUID,
        },
        data: {
          subCode: body.subCode,
          subNameEng: body.subNameEng,
          subNameThai: body.subNameThai,
          subCredit: parseFloat(body.subCredit),
          tchId: body.tchId,
          subTypeId: body.subTypeId,
        },
      });
      res.json(subject);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
  }
};

export const deleteSubject = async (req, res) => {
  const subjectId = req.params.UUID;
  if (subjectId) {
    try {
      await db.subject.update({
        where: {
          subId: subjectId,
        },
        data: {
          deletedAt: DateTime.now().toJSDate(),
        },
      });
      res.json({ message: "Delete subject success" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to delete subject", error: err.message });
    }
  }
};

export const getSubject = async (req, res) => {
  const subjectId = req.params.UUID;
  if (subjectId) {
    try {
      const subject = await db.subject.findFirst({
        where: {
          subId: subjectId,
          deletedAt: null,
        },
        include: {
          subjectType: true,
          teacher: true,
          timetable: {
            where: {
              deletedAt: null,
            },
            include: {
              classroom: {
                include: {
                  term: true,
                },
              },
              studyTime: {
                where: {
                  deletedAt: null,
                },
                include: {
                  attendance: {
                    where: {
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      res.json(subject);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to fetch subject", error: err.message });
    }
  }
};

export const getAllSubject = async (req, res) => {
  try {
    const subject = await db.subject.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        subjectType: true,
        teacher: true,
      },
    });
    res.json(subject);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch subjects", error: err.message });
  }
};

export const getSubjectByTeacher = async (req, res) => {
  if (req.user) {
    try {
      const subject = await db.subject.findMany({
        where: {
          tchId: req.user.id,
          deletedAt: null,
        },
        include: {
          subjectType: true,
          teacher: true,
          timetable: {
            where: {
              deletedAt: null,
            },
            include: {
              classroom: {
                include: {
                  term: true,
                },
              },
              studyTime: {
                where: {
                  deletedAt: null,
                },
              },
              subject: {
                include: {
                  teacher: true,
                },
              },
            },
          },
        },
      });
      res.json(subject);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to fetch subjects", error: err.message });
    }
  }
};

export const getSubjectByStudent = async (req, res) => {
  const studentId = req.user.id;
  const { termId } = req.params;
  if (studentId && termId) {
    try {
      const classroomMember = await db.classroomMember.findFirst({
        where: {
          stdId: studentId,
          deletedAt: null,
          classroom: {
            termId: termId,
            deletedAt: null,
          },
        },
        include: {
          classroom: {
            include: {
              timetable: {
                where: {
                  deletedAt: null,
                },
                include: {
                  subject: {
                    include: {
                      teacher: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!classroomMember) {
        return res
          .status(404)
          .json({ message: "Student not found in this term" });
      }

      const subjectList = classroomMember.classroom.timetable.reduce(
        (accumulator, item) => {
          // Filter out soft deleted subjects
          if (item.subject && !item.subject.deletedAt) {
            const itemfind = accumulator.find(
              (acc) => acc.subId === item.subject.subId
            );
            if (!itemfind) {
              accumulator.push(item.subject);
            }
          }
          return accumulator;
        },
        []
      );
      res.status(200).json(subjectList);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "something happen on server-side" });
    }
  } else {
    return res.status(400).json({ message: "bad requset" });
  }
};

export const softDeleteSubject = async (req, res) => {
  const subjectId = req.params.uuid;
  if (subjectId) {
    try {
      await db.subject.update({
        where: {
          subId: subjectId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      res.json({ message: "Soft delete subject success" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to soft delete subject", error: err.message });
    }
  }
};

export const restoreSubject = async (req, res) => {
  const subjectId = req.params.uuid;
  if (subjectId) {
    try {
      await db.subject.update({
        where: {
          subId: subjectId,
        },
        data: {
          deletedAt: null,
        },
      });
      res.json({ message: "Restore subject success" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to restore subject", error: err.message });
    }
  }
};

export const getSoftDeletedSubjects = async (req, res) => {
  try {
    const subjects = await db.subject.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      include: {
        subjectType: true,
        teacher: true,
      },
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch deleted subjects",
      error: err.message,
    });
  }
};

export const softDeleteSubjectType = async (req, res) => {
  const subjectTypeId = req.params.uuid;
  if (subjectTypeId) {
    try {
      await db.subjectType.update({
        where: {
          subTypeId: subjectTypeId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return res.json({ message: "Soft delete subject type success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to soft delete subject type",
        error: err.message,
      });
    }
  }
};

export const restoreSubjectType = async (req, res) => {
  const subjectTypeId = req.params.uuid;
  if (subjectTypeId) {
    try {
      await db.subjectType.update({
        where: {
          subTypeId: subjectTypeId,
        },
        data: {
          deletedAt: null,
        },
      });
      return res.json({ message: "Restore subject type success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to restore subject type",
        error: err.message,
      });
    }
  }
};

export const getSoftDeletedSubjectTypes = async (req, res) => {
  try {
    const subjectTypes = await db.subjectType.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });
    res.json(subjectTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch deleted subject types",
      error: err.message,
    });
  }
};
