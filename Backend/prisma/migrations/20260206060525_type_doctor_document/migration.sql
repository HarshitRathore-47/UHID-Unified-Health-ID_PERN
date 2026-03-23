/*
  Warnings:

  - Added the required column `type` to the `DoctorDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoctorDocument" ADD COLUMN     "type" TEXT NOT NULL;
