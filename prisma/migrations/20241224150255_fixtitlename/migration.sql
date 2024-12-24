/*
  Warnings:

  - The values [MRS,MISS] on the enum `Student_title` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `student` MODIFY `title` ENUM('BOY', 'GIRL', 'MR', 'MS') NOT NULL;
