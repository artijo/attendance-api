/*
  Warnings:

  - You are about to drop the column `tchCode` on the `teacher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Teacher_tchCode_key` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `tchCode`;
