-- CreateTable
CREATE TABLE `Student` (
    `stdId` VARCHAR(191) NOT NULL,
    `title` ENUM('BOY', 'GIRL', 'MR', 'MS') NOT NULL,
    `fName` VARCHAR(191) NOT NULL,
    `lName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Student_email_key`(`email`),
    UNIQUE INDEX `Student_tel_key`(`tel`),
    PRIMARY KEY (`stdId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leader` (
    `ldrId` VARCHAR(191) NOT NULL,
    `fName` VARCHAR(191) NOT NULL,
    `lName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Leader_email_key`(`email`),
    UNIQUE INDEX `Leader_tel_key`(`tel`),
    PRIMARY KEY (`ldrId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
    `tchId` VARCHAR(191) NOT NULL,
    `tchCode` VARCHAR(191) NOT NULL,
    `fName` VARCHAR(191) NOT NULL,
    `lName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `classId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Teacher_tchCode_key`(`tchCode`),
    UNIQUE INDEX `Teacher_email_key`(`email`),
    UNIQUE INDEX `Teacher_tel_key`(`tel`),
    PRIMARY KEY (`tchId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `deptId` VARCHAR(191) NOT NULL,
    `deptName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`deptId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parent` (
    `prntId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Parent_email_key`(`email`),
    UNIQUE INDEX `Parent_tel_key`(`tel`),
    PRIMARY KEY (`prntId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentParent` (
    `id` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `prntId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `subId` VARCHAR(191) NOT NULL,
    `subCode` VARCHAR(191) NOT NULL,
    `subNameThai` VARCHAR(191) NOT NULL,
    `subNameEng` VARCHAR(191) NULL,
    `subCredit` INTEGER NOT NULL,
    `tchId` VARCHAR(191) NOT NULL,
    `subTypeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Subject_subCode_key`(`subCode`),
    PRIMARY KEY (`subId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubjectType` (
    `subTypeId` VARCHAR(191) NOT NULL,
    `subTypeNameThai` VARCHAR(191) NOT NULL,
    `subTypeNameEng` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`subTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Classrooms` (
    `classId` VARCHAR(191) NOT NULL,
    `classLevel` INTEGER NOT NULL,
    `classRoom` INTEGER NOT NULL,
    `classTypeId` VARCHAR(191) NOT NULL,
    `termId` VARCHAR(191) NOT NULL,
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`classId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassroomMember` (
    `classRoomMemeberId` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `stdNo` VARCHAR(191) NOT NULL,
    `behaviourScore` INTEGER NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`classRoomMemeberId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassroomType` (
    `classTypeId` VARCHAR(191) NOT NULL,
    `classTypeNameThai` VARCHAR(191) NOT NULL,
    `classTypeNameEng` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`classTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timetable` (
    `timetableId` VARCHAR(191) NOT NULL,
    `subId` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `timeStart` VARCHAR(191) NOT NULL,
    `timeEnd` VARCHAR(191) NOT NULL,
    `timeLate` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`timetableId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudingTime` (
    `studyTimeId` VARCHAR(191) NOT NULL,
    `timetableId` VARCHAR(191) NOT NULL,
    `studingTimeDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`studyTimeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `attId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `studingTimeId` VARCHAR(191) NOT NULL,
    `attTimestamp` DATETIME(3) NOT NULL,
    `attStatus` ENUM('PRESENT', 'ABSENT', 'LATE', 'ACTIVITY', 'LEAVE') NOT NULL,
    `attMethodId` VARCHAR(191) NOT NULL,
    `latitute` DOUBLE NULL,
    `longitute` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `operatedBy` VARCHAR(191) NOT NULL,
    `tchId` VARCHAR(191) NULL,
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`attId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceMethod` (
    `attMethodId` VARCHAR(191) NOT NULL,
    `attMethodName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`attMethodId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditAttendance` (
    `attId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `studingTimeId` VARCHAR(191) NOT NULL,
    `attTimestamp` DATETIME(3) NOT NULL,
    `attStatus` ENUM('PRESENT', 'ABSENT', 'LATE', 'ACTIVITY', 'LEAVE') NOT NULL,
    `attMethodId` VARCHAR(191) NOT NULL,
    `latitute` DOUBLE NULL,
    `longitute` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `operatedBy` VARCHAR(191) NOT NULL,
    `tchId` VARCHAR(191) NULL,
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`attId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `leaveId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `leaveDate` DATETIME(3) NOT NULL,
    `leaveTypeId` VARCHAR(191) NOT NULL,
    `leaveReason` VARCHAR(191) NOT NULL,
    `leaveStatus` ENUM('WAITING', 'APPROVED', 'REJECTED') NOT NULL,
    `LeaveFile` VARCHAR(191) NULL,
    `tacherApproveId` VARCHAR(191) NULL,
    `approverTimestamp` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`leaveId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequestType` (
    `leaveTypeId` VARCHAR(191) NOT NULL,
    `leaveTypeName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`leaveTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequestStudingTime` (
    `leaveId` VARCHAR(191) NOT NULL,
    `studyTimeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `LeaveRequestStudingTime_leaveId_key`(`leaveId`),
    UNIQUE INDEX `LeaveRequestStudingTime_studyTimeId_key`(`studyTimeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `actId` VARCHAR(191) NOT NULL,
    `actName` VARCHAR(191) NOT NULL,
    `actDate` DATETIME(3) NOT NULL,
    `actDateEnd` DATETIME(3) NOT NULL,
    `actTypeId` VARCHAR(191) NOT NULL,
    `actStatus` ENUM('PROCESSING', 'FINISHED') NOT NULL,
    `actDesc` VARCHAR(191) NULL,
    `actLocation` VARCHAR(191) NULL,
    `actStartTime` VARCHAR(191) NULL,
    `actEndTime` VARCHAR(191) NULL,
    `joinLimit` BOOLEAN NOT NULL,
    `joinLimitNumber` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`actId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityType` (
    `actTypeId` VARCHAR(191) NOT NULL,
    `actTypeName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`actTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityTeacher` (
    `actTeacherId` VARCHAR(191) NOT NULL,
    `actId` VARCHAR(191) NOT NULL,
    `tchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`actTeacherId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassroomCanjoinActivity` (
    `classCanjoinId` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `actId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`classCanjoinId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityParticipate` (
    `actParticipateId` VARCHAR(191) NOT NULL,
    `actId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `joinTimestamp` DATETIME(3) NOT NULL,
    `operateBy` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NULL,
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`actParticipateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditActivityParticipate` (
    `actParticipateId` VARCHAR(191) NOT NULL,
    `actId` VARCHAR(191) NOT NULL,
    `stdId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `joinTimestamp` DATETIME(3) NOT NULL,
    `operateBy` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NULL,
    `leaderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`actParticipateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Holiday` (
    `holidayId` VARCHAR(191) NOT NULL,
    `startHolidayDate` DATETIME(3) NOT NULL,
    `endHolidayDate` DATETIME(3) NOT NULL,
    `holidayName` VARCHAR(191) NOT NULL,
    `type` ENUM('RATCHAKHAN', 'SCHOOL') NOT NULL,
    `termId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`holidayId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AcademicTerms` (
    `termId` VARCHAR(191) NOT NULL,
    `academicYear` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `termStart` DATETIME(3) NOT NULL,
    `termEnd` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`termId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `adminId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    UNIQUE INDEX `Admin_email_key`(`email`),
    UNIQUE INDEX `Admin_tel_key`(`tel`),
    PRIMARY KEY (`adminId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`deptId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentParent` ADD CONSTRAINT `StudentParent_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentParent` ADD CONSTRAINT `StudentParent_prntId_fkey` FOREIGN KEY (`prntId`) REFERENCES `Parent`(`prntId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_tchId_fkey` FOREIGN KEY (`tchId`) REFERENCES `Teacher`(`tchId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_subTypeId_fkey` FOREIGN KEY (`subTypeId`) REFERENCES `SubjectType`(`subTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classrooms` ADD CONSTRAINT `Classrooms_classTypeId_fkey` FOREIGN KEY (`classTypeId`) REFERENCES `ClassroomType`(`classTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classrooms` ADD CONSTRAINT `Classrooms_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicTerms`(`termId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classrooms` ADD CONSTRAINT `Classrooms_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassroomMember` ADD CONSTRAINT `ClassroomMember_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassroomMember` ADD CONSTRAINT `ClassroomMember_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timetable` ADD CONSTRAINT `Timetable_subId_fkey` FOREIGN KEY (`subId`) REFERENCES `Subject`(`subId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timetable` ADD CONSTRAINT `Timetable_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudingTime` ADD CONSTRAINT `StudingTime_timetableId_fkey` FOREIGN KEY (`timetableId`) REFERENCES `Timetable`(`timetableId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studingTimeId_fkey` FOREIGN KEY (`studingTimeId`) REFERENCES `StudingTime`(`studyTimeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_attMethodId_fkey` FOREIGN KEY (`attMethodId`) REFERENCES `AttendanceMethod`(`attMethodId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_tchId_fkey` FOREIGN KEY (`tchId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditAttendance` ADD CONSTRAINT `EditAttendance_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditAttendance` ADD CONSTRAINT `EditAttendance_studingTimeId_fkey` FOREIGN KEY (`studingTimeId`) REFERENCES `StudingTime`(`studyTimeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditAttendance` ADD CONSTRAINT `EditAttendance_attMethodId_fkey` FOREIGN KEY (`attMethodId`) REFERENCES `AttendanceMethod`(`attMethodId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditAttendance` ADD CONSTRAINT `EditAttendance_tchId_fkey` FOREIGN KEY (`tchId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditAttendance` ADD CONSTRAINT `EditAttendance_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveRequestType`(`leaveTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_tacherApproveId_fkey` FOREIGN KEY (`tacherApproveId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequestStudingTime` ADD CONSTRAINT `LeaveRequestStudingTime_leaveId_fkey` FOREIGN KEY (`leaveId`) REFERENCES `LeaveRequest`(`leaveId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequestStudingTime` ADD CONSTRAINT `LeaveRequestStudingTime_studyTimeId_fkey` FOREIGN KEY (`studyTimeId`) REFERENCES `StudingTime`(`studyTimeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_actTypeId_fkey` FOREIGN KEY (`actTypeId`) REFERENCES `ActivityType`(`actTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityTeacher` ADD CONSTRAINT `ActivityTeacher_tchId_fkey` FOREIGN KEY (`tchId`) REFERENCES `Teacher`(`tchId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityTeacher` ADD CONSTRAINT `ActivityTeacher_actId_fkey` FOREIGN KEY (`actId`) REFERENCES `Activity`(`actId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassroomCanjoinActivity` ADD CONSTRAINT `ClassroomCanjoinActivity_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassroomCanjoinActivity` ADD CONSTRAINT `ClassroomCanjoinActivity_actId_fkey` FOREIGN KEY (`actId`) REFERENCES `Activity`(`actId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticipate` ADD CONSTRAINT `ActivityParticipate_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticipate` ADD CONSTRAINT `ActivityParticipate_actId_fkey` FOREIGN KEY (`actId`) REFERENCES `Activity`(`actId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticipate` ADD CONSTRAINT `ActivityParticipate_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityParticipate` ADD CONSTRAINT `ActivityParticipate_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditActivityParticipate` ADD CONSTRAINT `EditActivityParticipate_stdId_fkey` FOREIGN KEY (`stdId`) REFERENCES `Student`(`stdId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditActivityParticipate` ADD CONSTRAINT `EditActivityParticipate_actId_fkey` FOREIGN KEY (`actId`) REFERENCES `Activity`(`actId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditActivityParticipate` ADD CONSTRAINT `EditActivityParticipate_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditActivityParticipate` ADD CONSTRAINT `EditActivityParticipate_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Holiday` ADD CONSTRAINT `Holiday_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicTerms`(`termId`) ON DELETE RESTRICT ON UPDATE CASCADE;
