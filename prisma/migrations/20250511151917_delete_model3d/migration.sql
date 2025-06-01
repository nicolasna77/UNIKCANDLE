/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `model3dUrl` on the `Scent` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_scentId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Scent" DROP COLUMN "model3dUrl",
ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "image",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT 'USER';

-- DropTable
DROP TABLE "ProductVariant";

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scent" ADD CONSTRAINT "Scent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
