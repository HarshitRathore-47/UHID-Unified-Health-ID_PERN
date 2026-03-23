/*
  Warnings:

  - You are about to drop the column `brand` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `datePrescribed` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `instructedTime` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `prescribedMedicineName` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Prescription` table. All the data in the column will be lost.
  - Made the column `diagnosis` on table `Prescription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "brand",
DROP COLUMN "datePrescribed",
DROP COLUMN "dosage",
DROP COLUMN "frequency",
DROP COLUMN "instructedTime",
DROP COLUMN "prescribedMedicineName",
DROP COLUMN "updatedAt",
ALTER COLUMN "diagnosis" SET NOT NULL;

-- CreateTable
CREATE TABLE "PrescriptionMedicine" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "prescribedMedicineName" TEXT NOT NULL,
    "brand" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "instructedTime" TEXT,

    CONSTRAINT "PrescriptionMedicine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrescriptionMedicine" ADD CONSTRAINT "PrescriptionMedicine_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
