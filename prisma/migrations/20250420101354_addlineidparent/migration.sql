/*
  Warnings:

  - A unique constraint covering the columns `[lineId]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `parent` ADD COLUMN `lineId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Parent_lineId_key` ON `Parent`(`lineId`);
