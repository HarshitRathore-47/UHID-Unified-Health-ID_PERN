-- DropForeignKey
ALTER TABLE "LabReport" DROP CONSTRAINT "LabReport_uhid_fkey";

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_uhid_fkey" FOREIGN KEY ("uhid") REFERENCES "Patient"("uhid") ON DELETE RESTRICT ON UPDATE CASCADE;
