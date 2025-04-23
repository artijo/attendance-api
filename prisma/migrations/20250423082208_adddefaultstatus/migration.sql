-- AlterTable
ALTER TABLE `leaverequeststudingtime` MODIFY `leaveStatus` ENUM('WAITING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'WAITING';
