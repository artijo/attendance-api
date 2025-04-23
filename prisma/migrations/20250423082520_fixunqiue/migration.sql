-- DropForeignKey
ALTER TABLE `leaverequeststudingtime` DROP FOREIGN KEY `LeaveRequestStudingTime_leaveId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequeststudingtime` DROP FOREIGN KEY `LeaveRequestStudingTime_studyTimeId_fkey`;

-- DropIndex
DROP INDEX `LeaveRequestStudingTime_leaveId_key` ON `leaverequeststudingtime`;

-- DropIndex
DROP INDEX `LeaveRequestStudingTime_studyTimeId_key` ON `leaverequeststudingtime`;

-- AddForeignKey
ALTER TABLE `LeaveRequestStudingTime` ADD CONSTRAINT `LeaveRequestStudingTime_studyTimeId_fkey` FOREIGN KEY (`studyTimeId`) REFERENCES `StudingTime`(`studyTimeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequestStudingTime` ADD CONSTRAINT `LeaveRequestStudingTime_tacherApproveId_fkey` FOREIGN KEY (`tacherApproveId`) REFERENCES `Teacher`(`tchId`) ON DELETE SET NULL ON UPDATE CASCADE;
