/*
  Warnings:

  - You are about to drop the column `foodItems` on the `Diet` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `Diet` table. All the data in the column will be lost.
  - The `avoidanceRestriction` column on the `Diet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Diet" DROP COLUMN "foodItems",
DROP COLUMN "mealType",
ADD COLUMN     "breakfastItems" TEXT[],
ADD COLUMN     "dinnerItems" TEXT[],
ADD COLUMN     "lunchItems" TEXT[],
DROP COLUMN "avoidanceRestriction",
ADD COLUMN     "avoidanceRestriction" TEXT[];

-- DropEnum
DROP TYPE "MealType";
