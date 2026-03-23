/*
  Warnings:

  - You are about to drop the `ActiveTreatment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_reportId_fkey";

-- DropTable
DROP TABLE "ActiveTreatment";

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "hospitalOrClinicName" TEXT NOT NULL,
    "lastVisitedDate" TIMESTAMP(3) NOT NULL,
    "nextVisitedDate" TIMESTAMP(3),
    "prescriptionId" TEXT,
    "reportId" TEXT,
    "currentProgress" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
