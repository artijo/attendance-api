/*
  Warnings:

  - You are about to drop the column `academicYear` on the `Classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Classrooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Classrooms` DROP COLUMN `academicYear`,
    DROP COLUMN `semester`;
