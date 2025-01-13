/*
  Warnings:

  - You are about to drop the column `howAddType` on the `holiday` table. All the data in the column will be lost.
  - You are about to alter the column `endHolidayDate` on the `holiday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `holidayName` on the `holiday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - Added the required column `type` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `holiday` DROP COLUMN `howAddType`,
    ADD COLUMN `type` ENUM('RATCHAKHAN', 'SCHOOL') NOT NULL,
    MODIFY `endHolidayDate` DATETIME(3) NOT NULL,
    MODIFY `holidayName` DATETIME(3) NOT NULL;
