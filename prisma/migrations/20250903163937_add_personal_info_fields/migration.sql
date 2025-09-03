-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "wifeName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "wifeName" TEXT;

-- CreateIndex
CREATE INDEX "Order_idNumber_idx" ON "Order"("idNumber");

-- CreateIndex
CREATE INDEX "User_idNumber_idx" ON "User"("idNumber");
