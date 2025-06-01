/*
  Warnings:

  - You are about to drop the column `userId` on the `Image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "image" TEXT;
