-- CreateTable
CREATE TABLE "Student" (
    "stdId" TEXT NOT NULL PRIMARY KEY,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "cityzenId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Leader" (
    "ldrId" TEXT NOT NULL PRIMARY KEY,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Teacher" (
    "tchId" TEXT NOT NULL PRIMARY KEY,
    "tchCode" TEXT NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "password" TEXT NOT NULL,
    "deptId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Teacher_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department" ("deptId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Teacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classrooms" ("classId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "deptId" TEXT NOT NULL PRIMARY KEY,
    "deptCode" TEXT NOT NULL,
    "deptName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Parent" (
    "prntId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentParent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stdId" TEXT NOT NULL,
    "prntId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentParent_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentParent_prntId_fkey" FOREIGN KEY ("prntId") REFERENCES "Parent" ("prntId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "subId" TEXT NOT NULL PRIMARY KEY,
    "subCode" TEXT NOT NULL,
    "subNameThai" TEXT NOT NULL,
    "subNameEng" TEXT,
    "subCredit" INTEGER NOT NULL,
    "tchId" TEXT NOT NULL,
    "subTypeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subject_tchId_fkey" FOREIGN KEY ("tchId") REFERENCES "Teacher" ("tchId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subject_subTypeId_fkey" FOREIGN KEY ("subTypeId") REFERENCES "SubjectType" ("subTypeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubjectType" (
    "subTypeId" TEXT NOT NULL PRIMARY KEY,
    "subTypeCode" TEXT NOT NULL,
    "subTypeNameThai" TEXT NOT NULL,
    "subTypeNameEng" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Classrooms" (
    "classId" TEXT NOT NULL PRIMARY KEY,
    "classLevel" INTEGER NOT NULL,
    "classRoom" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "classTypeId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Classrooms_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassroomType" ("classTypeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Classrooms_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader" ("ldrId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassroomType" (
    "classTypeId" TEXT NOT NULL PRIMARY KEY,
    "classTypeNameThai" TEXT NOT NULL,
    "classTypeNameEng" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Timetable" (
    "timetableId" TEXT NOT NULL PRIMARY KEY,
    "subId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "tchId" TEXT NOT NULL,
    "timeStart" DATETIME NOT NULL,
    "timeEnd" DATETIME NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timetable_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subject" ("subId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timetable_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classrooms" ("classId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudingTime" (
    "studyTimeId" TEXT NOT NULL PRIMARY KEY,
    "timetableId" TEXT NOT NULL,
    "studingTimeDate" DATETIME NOT NULL,
    CONSTRAINT "StudingTime_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable" ("timetableId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attId" TEXT NOT NULL PRIMARY KEY,
    "stdId" TEXT NOT NULL,
    "studingTimeId" TEXT NOT NULL,
    "attTimestamp" DATETIME NOT NULL,
    "attStatus" TEXT NOT NULL,
    "attMethodId" TEXT NOT NULL,
    "latitute" REAL,
    "longitute" REAL,
    "note" TEXT,
    "operatedBy" TEXT NOT NULL,
    "tchId" TEXT,
    "leaderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_studingTimeId_fkey" FOREIGN KEY ("studingTimeId") REFERENCES "StudingTime" ("studyTimeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_attMethodId_fkey" FOREIGN KEY ("attMethodId") REFERENCES "AttendanceMethod" ("attMethodId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_tchId_fkey" FOREIGN KEY ("tchId") REFERENCES "Teacher" ("tchId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Attendance_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader" ("ldrId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceMethod" (
    "attMethodId" TEXT NOT NULL PRIMARY KEY,
    "attMethodName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EditAttendance" (
    "attId" TEXT NOT NULL PRIMARY KEY,
    "stdId" TEXT NOT NULL,
    "studingTimeId" TEXT NOT NULL,
    "attTimestamp" DATETIME NOT NULL,
    "attStatus" TEXT NOT NULL,
    "attMethodId" TEXT NOT NULL,
    "latitute" REAL,
    "longitute" REAL,
    "note" TEXT,
    "operatedBy" TEXT NOT NULL,
    "tchId" TEXT,
    "leaderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EditAttendance_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EditAttendance_studingTimeId_fkey" FOREIGN KEY ("studingTimeId") REFERENCES "StudingTime" ("studyTimeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EditAttendance_attMethodId_fkey" FOREIGN KEY ("attMethodId") REFERENCES "AttendanceMethod" ("attMethodId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EditAttendance_tchId_fkey" FOREIGN KEY ("tchId") REFERENCES "Teacher" ("tchId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EditAttendance_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader" ("ldrId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "leaveId" TEXT NOT NULL PRIMARY KEY,
    "stdId" TEXT NOT NULL,
    "leaveDate" DATETIME NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "leaveReason" TEXT NOT NULL,
    "leaveStatus" TEXT NOT NULL,
    "LeaveFile" TEXT,
    "tacherApproveId" TEXT,
    "approverTimestamp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveRequest_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveRequestType" ("leaveTypeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_tacherApproveId_fkey" FOREIGN KEY ("tacherApproveId") REFERENCES "Teacher" ("tchId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequestType" (
    "leaveTypeId" TEXT NOT NULL PRIMARY KEY,
    "leaveTypeName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LeaveRequestStudingTime" (
    "leaveId" TEXT NOT NULL,
    "studyTimeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveRequestStudingTime_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "LeaveRequest" ("leaveId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequestStudingTime_studyTimeId_fkey" FOREIGN KEY ("studyTimeId") REFERENCES "StudingTime" ("studyTimeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "actId" TEXT NOT NULL PRIMARY KEY,
    "actName" TEXT NOT NULL,
    "actDate" DATETIME NOT NULL,
    "actTypeId" TEXT NOT NULL,
    "actStatus" TEXT NOT NULL,
    "actDesc" TEXT,
    "actLocation" TEXT,
    "actStartTime" DATETIME,
    "actEndTime" DATETIME,
    "joinLimit" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_actTypeId_fkey" FOREIGN KEY ("actTypeId") REFERENCES "ActivityType" ("actTypeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityType" (
    "actTypeId" TEXT NOT NULL PRIMARY KEY,
    "actTypeName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityTeacher" (
    "actId" TEXT NOT NULL,
    "tchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityTeacher_tchId_fkey" FOREIGN KEY ("tchId") REFERENCES "Teacher" ("tchId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityTeacher_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Activity" ("actId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassroomCanjoinActivity" (
    "classId" TEXT NOT NULL,
    "actId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassroomCanjoinActivity_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classrooms" ("classId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassroomCanjoinActivity_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Activity" ("actId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityParticipate" (
    "actParticipateId" TEXT NOT NULL PRIMARY KEY,
    "actId" TEXT NOT NULL,
    "stdId" TEXT NOT NULL,
    "note" TEXT,
    "joinTimestamp" DATETIME NOT NULL,
    "operateBy" TEXT NOT NULL,
    "teacherId" TEXT,
    "leaderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityParticipate_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityParticipate_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Activity" ("actId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityParticipate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("tchId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ActivityParticipate_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader" ("ldrId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditActivityParticipate" (
    "actParticipateId" TEXT NOT NULL PRIMARY KEY,
    "actId" TEXT NOT NULL,
    "stdId" TEXT NOT NULL,
    "note" TEXT,
    "joinTimestamp" DATETIME NOT NULL,
    "operateBy" TEXT NOT NULL,
    "teacherId" TEXT,
    "leaderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EditActivityParticipate_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Student" ("stdId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EditActivityParticipate_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Activity" ("actId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EditActivityParticipate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("tchId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EditActivityParticipate_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader" ("ldrId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_tel_key" ON "Student"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "Student_cityzenId_key" ON "Student"("cityzenId");

-- CreateIndex
CREATE UNIQUE INDEX "Leader_email_key" ON "Leader"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Leader_tel_key" ON "Leader"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_tchCode_key" ON "Teacher"("tchCode");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_tel_key" ON "Teacher"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "Department_deptCode_key" ON "Department"("deptCode");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_tel_key" ON "Parent"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subCode_key" ON "Subject"("subCode");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectType_subTypeCode_key" ON "SubjectType"("subTypeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_classId_key" ON "Timetable"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveRequestStudingTime_leaveId_key" ON "LeaveRequestStudingTime"("leaveId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveRequestStudingTime_studyTimeId_key" ON "LeaveRequestStudingTime"("studyTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTeacher_actId_key" ON "ActivityTeacher"("actId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTeacher_tchId_key" ON "ActivityTeacher"("tchId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomCanjoinActivity_classId_key" ON "ClassroomCanjoinActivity"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomCanjoinActivity_actId_key" ON "ClassroomCanjoinActivity"("actId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_tel_key" ON "Admin"("tel");
