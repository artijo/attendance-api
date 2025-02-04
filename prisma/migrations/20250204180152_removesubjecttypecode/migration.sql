/*
  Warnings:

  - You are about to drop the column `subTypeCode` on the `subjecttype` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `SubjectType_subTypeCode_key` ON `subjecttype`;

-- AlterTable
ALTER TABLE `subjecttype` DROP COLUMN `subTypeCode`;
