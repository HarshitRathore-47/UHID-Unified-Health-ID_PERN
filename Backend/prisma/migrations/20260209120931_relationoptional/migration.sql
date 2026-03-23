-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveTreatment" DROP CONSTRAINT "ActiveTreatment_reportId_fkey";

-- AlterTable
ALTER TABLE "ActiveTreatment" ALTER COLUMN "prescriptionId" DROP NOT NULL,
ALTER COLUMN "reportId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ActiveTreatment" ADD CONSTRAINT "ActiveTreatment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveTreatment" ADD CONSTRAINT "ActiveTreatment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE SET NULL ON UPDATE CASCADE;
