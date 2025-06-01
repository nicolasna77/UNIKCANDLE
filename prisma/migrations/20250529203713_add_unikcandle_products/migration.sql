/*
  Warnings:

  - You are about to drop the `_ProductToScent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `arAnimation` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scentId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slogan` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ProductToScent" DROP CONSTRAINT "_ProductToScent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToScent" DROP CONSTRAINT "_ProductToScent_B_fkey";

-- Drop existing relations
DROP TABLE IF EXISTS "_ProductToScent";

-- Add new columns with default values
ALTER TABLE "Product" ADD COLUMN "arAnimation" TEXT NOT NULL DEFAULT 'default-animation';
ALTER TABLE "Product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Amour';
ALTER TABLE "Product" ADD COLUMN "slogan" TEXT NOT NULL DEFAULT 'Une bougie unique pour des moments inoubliables';

-- Create new scent relation (nullable)
ALTER TABLE "Product" ADD COLUMN "scentId" TEXT;
ALTER TABLE "Product" ADD CONSTRAINT "Product_scentId_fkey" FOREIGN KEY ("scentId") REFERENCES "Scent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Scent" ADD COLUMN     "notes" TEXT[];

-- Remove default values after adding them
ALTER TABLE "Product" ALTER COLUMN "arAnimation" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "slogan" DROP DEFAULT;
