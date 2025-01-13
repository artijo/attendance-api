/*
  Warnings:

  - You are about to alter the column `startHolidayDate` on the `holiday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `holiday` MODIFY `startHolidayDate` DATETIME(3) NOT NULL,
    MODIFY `holidayName` VARCHAR(191) NOT NULL;
