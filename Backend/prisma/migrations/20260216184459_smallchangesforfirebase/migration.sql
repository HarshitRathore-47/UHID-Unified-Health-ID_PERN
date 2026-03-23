/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `LabReport` table. All the data in the column will be lost.
  - The primary key for the `VaccinationHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `VaccinationId` on the `VaccinationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `VaccineDate` on the `VaccinationHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doctorId,type]` on the table `DoctorDocument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patientId,type]` on the table `PatientDocument` will be added. If there are existing duplicate values, this will fail.
  - Made the column `mimeType` on table `DoctorDocument` required. This step will fail if there are existing NULL values in that column.
  - The required column `vaccinationId` was added to the `VaccinationHistory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `vaccineDate` to the `VaccinationHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DoctorDocument_doctorId_idx";

-- AlterTable
ALTER TABLE "DoctorDocument" ALTER COLUMN "mimeType" SET NOT NULL;

-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "fileUrl",
ADD COLUMN     "fileKey" TEXT;

-- AlterTable
ALTER TABLE "VaccinationHistory" DROP CONSTRAINT "VaccinationHistory_pkey",
DROP COLUMN "VaccinationId",
DROP COLUMN "VaccineDate",
ADD COLUMN     "vaccinationId" TEXT NOT NULL,
ADD COLUMN     "vaccineDate" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "VaccinationHistory_pkey" PRIMARY KEY ("vaccinationId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorDocument_doctorId_type_key" ON "DoctorDocument"("doctorId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDocument_patientId_type_key" ON "PatientDocument"("patientId", "type");
