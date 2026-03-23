/*
  Warnings:

  - A unique constraint covering the columns `[patientId]` on the table `HealthProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HealthProfile_patientId_key" ON "HealthProfile"("patientId");
