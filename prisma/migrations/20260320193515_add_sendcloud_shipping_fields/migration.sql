-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sendcloudParcelId" TEXT,
ADD COLUMN     "shippingCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "shippingMethodId" INTEGER,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT;
