/*
  Warnings:

  - You are about to drop the column `productId` on the `Scent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scent" DROP CONSTRAINT "Scent_productId_fkey";

-- AlterTable
ALTER TABLE "Scent" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "_ProductToScent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToScent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductToScent_B_index" ON "_ProductToScent"("B");

-- AddForeignKey
ALTER TABLE "_ProductToScent" ADD CONSTRAINT "_ProductToScent_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToScent" ADD CONSTRAINT "_ProductToScent_B_fkey" FOREIGN KEY ("B") REFERENCES "Scent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
