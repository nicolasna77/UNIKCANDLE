-- AlterTable
ALTER TABLE "_ProductToScent" ADD CONSTRAINT "_ProductToScent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductToScent_AB_unique";
