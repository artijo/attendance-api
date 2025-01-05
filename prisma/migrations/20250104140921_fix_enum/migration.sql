/*
  Warnings:

  - You are about to alter the column `howAddType` on the `holiday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `holiday` MODIFY `howAddType` ENUM('RATCHAKHAN', 'SCHOOL') NOT NULL;
