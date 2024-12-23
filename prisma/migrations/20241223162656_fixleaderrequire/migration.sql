-- DropForeignKey
ALTER TABLE `classrooms` DROP FOREIGN KEY `Classrooms_leaderId_fkey`;

-- AlterTable
ALTER TABLE `classrooms` MODIFY `leaderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Classrooms` ADD CONSTRAINT `Classrooms_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `Leader`(`ldrId`) ON DELETE SET NULL ON UPDATE CASCADE;
