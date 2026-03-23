/*
  Warnings:

  - You are about to drop the column `GuardianName` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "GuardianName",
ADD COLUMN     "guardianName" TEXT;
