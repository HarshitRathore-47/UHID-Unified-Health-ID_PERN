/*
  Warnings:

  - You are about to drop the column `fatherName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `motherName` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "fatherName",
DROP COLUMN "motherName",
ADD COLUMN     "GuardianName" TEXT;
