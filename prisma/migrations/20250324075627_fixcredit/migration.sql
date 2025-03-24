/*
  Warnings:

  - You are about to alter the column `subCredit` on the `subject` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `subject` MODIFY `subCredit` DOUBLE NOT NULL;
