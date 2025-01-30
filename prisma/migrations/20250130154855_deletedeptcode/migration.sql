/*
  Warnings:

  - You are about to drop the column `deptCode` on the `department` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Department_deptCode_key` ON `department`;

-- AlterTable
ALTER TABLE `department` DROP COLUMN `deptCode`;
