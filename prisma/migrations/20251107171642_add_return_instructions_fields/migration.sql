-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "returnAddress" TEXT,
ADD COLUMN     "returnDeadline" TIMESTAMP(3),
ADD COLUMN     "returnInstructions" TEXT;
