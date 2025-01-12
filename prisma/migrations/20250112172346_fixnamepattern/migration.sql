/*
  Warnings:

  - You are about to drop the `Academic_terms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Classrooms` DROP FOREIGN KEY `Classrooms_termId_fkey`;

-- DropForeignKey
ALTER TABLE `Holiday` DROP FOREIGN KEY `Holiday_termId_fkey`;

-- DropIndex
DROP INDEX `Classrooms_termId_fkey` ON `Classrooms`;

-- DropIndex
DROP INDEX `Holiday_termId_fkey` ON `Holiday`;

-- DropTable
DROP TABLE `Academic_terms`;

-- CreateTable
CREATE TABLE `AcademicTerms` (
    `termId` VARCHAR(191) NOT NULL,
    `academicYear` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `termStart` DATETIME(3) NOT NULL,
    `termEnd` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`termId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Classrooms` ADD CONSTRAINT `Classrooms_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicTerms`(`termId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Holiday` ADD CONSTRAINT `Holiday_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `AcademicTerms`(`termId`) ON DELETE RESTRICT ON UPDATE CASCADE;
