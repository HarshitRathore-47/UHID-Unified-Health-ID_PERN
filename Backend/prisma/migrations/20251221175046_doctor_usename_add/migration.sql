/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userName_key" ON "Doctor"("userName");
