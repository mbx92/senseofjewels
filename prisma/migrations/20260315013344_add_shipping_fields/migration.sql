-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingCost" DECIMAL(15,2),
ADD COLUMN     "shippingCourier" TEXT,
ADD COLUMN     "shippingService" TEXT;
