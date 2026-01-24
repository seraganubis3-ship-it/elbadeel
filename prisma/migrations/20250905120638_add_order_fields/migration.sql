-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fines" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalDocuments" TEXT,
ADD COLUMN     "otherFees" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pickupLocation" TEXT,
ADD COLUMN     "policeStation" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "serviceDetails" TEXT;
