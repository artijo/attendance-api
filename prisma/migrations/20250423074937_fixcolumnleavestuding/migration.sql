/*
  Warnings:

  - You are about to drop the column `approverTimestamp` on the `leaverequest` table. All the data in the column will be lost.
  - You are about to drop the column `leaveStatus` on the `leaverequest` table. All the data in the column will be lost.
  - You are about to drop the column `tacherApproveId` on the `leaverequest` table. All the data in the column will be lost.
  - Added the required column `leaveStatus` to the `LeaveRequestStudingTime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `leaverequest` DROP FOREIGN KEY `LeaveRequest_tacherApproveId_fkey`;

-- DropIndex
DROP INDEX `LeaveRequest_tacherApproveId_fkey` ON `leaverequest`;

-- AlterTable
ALTER TABLE `leaverequest` DROP COLUMN `approverTimestamp`,
    DROP COLUMN `leaveStatus`,
    DROP COLUMN `tacherApproveId`;

-- AlterTable
ALTER TABLE `leaverequeststudingtime` ADD COLUMN `approverTimestamp` DATETIME(3) NULL,
    ADD COLUMN `leaveStatus` ENUM('WAITING', 'APPROVED', 'REJECTED') NOT NULL,
    ADD COLUMN `tacherApproveId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LeaveRequestStudingTime` ADD CONSTRAINT `LeaveRequestStudingTime_tacherApproveId_fkey` FOREIGN KEY (`tacherApproveId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;
