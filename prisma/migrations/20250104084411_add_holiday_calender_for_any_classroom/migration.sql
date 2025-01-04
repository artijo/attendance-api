-- CreateTable
CREATE TABLE `Holiday` (
    `holyDayId` VARCHAR(191) NOT NULL,
    `holyDayDate` DATETIME(3) NOT NULL,
    `holyDayName` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`holyDayId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Holiday` ADD CONSTRAINT `Holiday_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Classrooms`(`classId`) ON DELETE RESTRICT ON UPDATE CASCADE;
