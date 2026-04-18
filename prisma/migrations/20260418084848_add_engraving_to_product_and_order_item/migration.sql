-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "engravingText" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "engravingPrice" DOUBLE PRECISION,
ADD COLUMN     "hasEngraving" BOOLEAN NOT NULL DEFAULT false;
