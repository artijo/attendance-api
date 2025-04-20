/*
  Warnings:

  - You are about to drop the `editactivityparticipate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `editattendance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lineId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lineId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `editactivityparticipate` DROP FOREIGN KEY `EditActivityParticipate_actId_fkey`;

-- DropForeignKey
ALTER TABLE `editactivityparticipate` DROP FOREIGN KEY `EditActivityParticipate_leaderId_fkey`;

-- DropForeignKey
ALTER TABLE `editactivityparticipate` DROP FOREIGN KEY `EditActivityParticipate_stdId_fkey`;

-- DropForeignKey
ALTER TABLE `editactivityparticipate` DROP FOREIGN KEY `EditActivityParticipate_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `editattendance` DROP FOREIGN KEY `EditAttendance_attMethodId_fkey`;

-- DropForeignKey
ALTER TABLE `editattendance` DROP FOREIGN KEY `EditAttendance_leaderId_fkey`;

-- DropForeignKey
ALTER TABLE `editattendance` DROP FOREIGN KEY `EditAttendance_stdId_fkey`;

-- DropForeignKey
ALTER TABLE `editattendance` DROP FOREIGN KEY `EditAttendance_studingTimeId_fkey`;

-- DropForeignKey
ALTER TABLE `editattendance` DROP FOREIGN KEY `EditAttendance_tchId_fkey`;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `googleId` VARCHAR(191) NULL,
    ADD COLUMN `lineId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `googleId` VARCHAR(191) NULL,
    ADD COLUMN `lineId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `editactivityparticipate`;

-- DropTable
DROP TABLE `editattendance`;

-- CreateIndex
CREATE UNIQUE INDEX `Student_googleId_key` ON `Student`(`googleId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_lineId_key` ON `Student`(`lineId`);

-- CreateIndex
CREATE UNIQUE INDEX `Teacher_googleId_key` ON `Teacher`(`googleId`);

-- CreateIndex
CREATE UNIQUE INDEX `Teacher_lineId_key` ON `Teacher`(`lineId`);
