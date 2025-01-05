/*
  Warnings:

  - Added the required column `howAddType` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `holiday` ADD COLUMN `howAddType` VARCHAR(191) NOT NULL;
