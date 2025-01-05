-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_classId_fkey`;

-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_deptId_fkey`;

-- DropIndex
DROP INDEX `Teacher_classId_fkey` ON `teacher`;

-- DropIndex
DROP INDEX `Teacher_deptId_fkey` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` MODIFY `deptId` VARCHAR(191) NULL,
    MODIFY `classId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`deptId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE SET NULL ON UPDATE CASCADE;
