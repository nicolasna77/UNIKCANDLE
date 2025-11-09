-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "textMessage" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'audio';
