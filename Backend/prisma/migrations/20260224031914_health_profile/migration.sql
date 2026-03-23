/*
  Warnings:

  - The `longTermDiseases` column on the `HealthProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "HealthProfile" DROP COLUMN "longTermDiseases",
ADD COLUMN     "longTermDiseases" TEXT[];
