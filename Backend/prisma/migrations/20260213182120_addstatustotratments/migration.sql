-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "Treatment" ADD COLUMN     "status" "TreatmentStatus" NOT NULL DEFAULT 'ACTIVE';
