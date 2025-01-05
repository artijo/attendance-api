/*
  Warnings:

  - You are about to drop the column `holidayDate` on the `holiday` table. All the data in the column will be lost.
  - Added the required column `endHolidayDate` to the `Holiday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startHolidayDate` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `holiday` DROP COLUMN `holidayDate`,
    ADD COLUMN `endHolidayDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `startHolidayDate` VARCHAR(191) NOT NULL;
