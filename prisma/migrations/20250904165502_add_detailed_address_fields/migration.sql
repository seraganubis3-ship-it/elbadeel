-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "apartmentNumber" TEXT,
ADD COLUMN     "buildingNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "governorate" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "street" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apartmentNumber" TEXT,
ADD COLUMN     "buildingNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "governorate" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "street" TEXT;
