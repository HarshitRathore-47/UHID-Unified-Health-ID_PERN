/*
  Warnings:

  - The `status` column on the `LabReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LabReportStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "status",
ADD COLUMN     "status" "LabReportStatus" NOT NULL DEFAULT 'PENDING';
