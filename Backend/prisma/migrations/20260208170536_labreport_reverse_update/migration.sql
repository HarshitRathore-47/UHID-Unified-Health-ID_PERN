/*
  Warnings:

  - You are about to drop the column `uhid` on the `LabReport` table. All the data in the column will be lost.
  - Added the required column `PatientId` to the `LabReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LabReport" DROP CONSTRAINT "LabReport_uhid_fkey";

-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "uhid",
ADD COLUMN     "PatientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_PatientId_fkey" FOREIGN KEY ("PatientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
