-- DropForeignKey
ALTER TABLE "LabResult" DROP CONSTRAINT "LabResult_reportId_fkey";

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE CASCADE ON UPDATE CASCADE;
