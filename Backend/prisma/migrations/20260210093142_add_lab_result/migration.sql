/*
  Warnings:

  - You are about to drop the column `createdAt` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `referenceRange` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `resultValue` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `statusFlag` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `LabReport` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LabReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "createdAt",
DROP COLUMN "referenceRange",
DROP COLUMN "resultValue",
DROP COLUMN "statusFlag",
DROP COLUMN "unit",
DROP COLUMN "updatedAt",
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "statusFlag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LabReport"("reportId") ON DELETE RESTRICT ON UPDATE CASCADE;
