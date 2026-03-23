/*
  Warnings:

  - You are about to drop the `ActiveDiet` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DietStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ActiveDiet" DROP CONSTRAINT "ActiveDiet_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveDiet" DROP CONSTRAINT "ActiveDiet_patientId_fkey";

-- DropTable
DROP TABLE "ActiveDiet";

-- CreateTable
CREATE TABLE "Diet" (
    "dietId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dietName" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "foodItems" TEXT[],
    "avoidanceRestriction" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "doctorHospitalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DietStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Diet_pkey" PRIMARY KEY ("dietId")
);

-- AddForeignKey
ALTER TABLE "Diet" ADD CONSTRAINT "Diet_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diet" ADD CONSTRAINT "Diet_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
