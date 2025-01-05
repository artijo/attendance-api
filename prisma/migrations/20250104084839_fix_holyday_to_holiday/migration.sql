/*
  Warnings:

  - The primary key for the `holiday` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `holyDayDate` on the `holiday` table. All the data in the column will be lost.
  - You are about to drop the column `holyDayId` on the `holiday` table. All the data in the column will be lost.
  - You are about to drop the column `holyDayName` on the `holiday` table. All the data in the column will be lost.
  - Added the required column `holidayDate` to the `Holiday` table without a default value. This is not possible if the table is not empty.
  - The required column `holidayId` was added to the `Holiday` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `holidayName` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `holiday` DROP PRIMARY KEY,
    DROP COLUMN `holyDayDate`,
    DROP COLUMN `holyDayId`,
    DROP COLUMN `holyDayName`,
    ADD COLUMN `holidayDate` DATETIME(3) NOT NULL,
    ADD COLUMN `holidayId` VARCHAR(191) NOT NULL,
    ADD COLUMN `holidayName` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`holidayId`);
