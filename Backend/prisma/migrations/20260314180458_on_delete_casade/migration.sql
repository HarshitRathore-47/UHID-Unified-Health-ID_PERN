-- DropForeignKey
ALTER TABLE "Treatment" DROP CONSTRAINT "Treatment_reportId_fkey";

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE CASCADE ON UPDATE CASCADE;
