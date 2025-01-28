/*
  Warnings:

  - You are about to drop the column `cityzenId` on the `student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Student_cityzenId_key` ON `student`;

-- AlterTable
ALTER TABLE `activity` ADD COLUMN `joinLimitNumber` INTEGER NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `cityzenId`;
