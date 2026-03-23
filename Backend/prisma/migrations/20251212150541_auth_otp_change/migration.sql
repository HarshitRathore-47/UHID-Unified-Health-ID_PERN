/*
  Warnings:

  - You are about to drop the column `doctorId` on the `AuthOtp` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `AuthOtp` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'REGISTER';

-- DropForeignKey
ALTER TABLE "AuthOtp" DROP CONSTRAINT "AuthOtp_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "AuthOtp" DROP CONSTRAINT "AuthOtp_patientId_fkey";

-- DropIndex
DROP INDEX "AuthOtp_doctorId_purpose_idx";

-- DropIndex
DROP INDEX "AuthOtp_expiresAt_idx";

-- DropIndex
DROP INDEX "AuthOtp_patientId_purpose_idx";

-- AlterTable
ALTER TABLE "AuthOtp" DROP COLUMN "doctorId",
DROP COLUMN "patientId",
ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE INDEX "AuthOtp_email_idx" ON "AuthOtp"("email");
