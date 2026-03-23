/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `password` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Admin_username_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "passwordHash",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
DROP COLUMN "username",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
