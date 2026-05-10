import db from "./prisma/client.js";

async function test() {
  try {
    const mostAbsent = await db.attendance.groupBy({
      by: ["stdId"],
      where: {
        attStatus: "ABSENT",
      },
      _count: {
        attStatus: true,
      },
      orderBy: {
        _count: {
          attStatus: "desc",
        },
      },
      take: 5,
    });
    mostAbsent.forEach(async (record) => {
      const student = await db.student.findUnique({
        where: { stdId: record.stdId },
      });
      console.log(
        `Student: ${student.fName} ${student.lName}, Absences: ${record._count.attStatus}`,
      );
    });
  } catch (error) {
    console.error(error);
  }
}

test();
