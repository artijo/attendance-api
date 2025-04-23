/*
  Warnings:

  - The required column `leaveRequestStudingTimeId` was added to the `LeaveRequestStudingTime` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `leaverequeststudingtime` ADD COLUMN `leaveRequestStudingTimeId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`leaveRequestStudingTimeId`);
