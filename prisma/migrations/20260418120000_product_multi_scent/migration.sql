-- CreateTable: implicit many-to-many join table for Product <-> Scent
CREATE TABLE "_ProductToScent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductToScent_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductToScent_B_fkey" FOREIGN KEY ("B") REFERENCES "Scent"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing single-scent data to the join table
INSERT INTO "_ProductToScent" ("A", "B")
SELECT "id", "scentId" FROM "Product" WHERE "scentId" IS NOT NULL;

-- CreateIndex: required by Prisma for implicit M2M
CREATE UNIQUE INDEX "_ProductToScent_AB_unique" ON "_ProductToScent"("A", "B");
CREATE INDEX "_ProductToScent_B_index" ON "_ProductToScent"("B");

-- DropIndex: old scentId index on Product
DROP INDEX IF EXISTS "Product_scentId_idx";

-- DropForeignKey: old FK constraint
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_scentId_fkey";

-- AlterTable: drop the old scentId column
ALTER TABLE "Product" DROP COLUMN "scentId";
