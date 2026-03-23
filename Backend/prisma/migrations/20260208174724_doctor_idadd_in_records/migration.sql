/*
  Warnings:

  - You are about to drop the column `PatientId` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `refId` on the `VisitHistory` table. All the data in the column will be lost.
  - Added the required column `doctorId` to the `ActiveTreatment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `LabReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `LabReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `VaccinationHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `VisitHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LabReport" DROP CONSTRAINT "LabReport_PatientId_fkey";

-- AlterTable
ALTER TABLE "ActiveTreatment" ADD COLUMN     "doctorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "PatientId",
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VaccinationHistory" ADD COLUMN     "doctorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VisitHistory" DROP COLUMN "refId",
ADD COLUMN     "doctorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveTreatment" ADD CONSTRAINT "ActiveTreatment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationHistory" ADD CONSTRAINT "VaccinationHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitHistory" ADD CONSTRAINT "VisitHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
