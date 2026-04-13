/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,productId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedColor` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedSize` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedColor` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedSize` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shoeType` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Brand" AS ENUM ('NIKE', 'ADIDAS', 'PUMA', 'NEW_BALANCE', 'CONVERSE', 'VANS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- CreateEnum
CREATE TYPE "ShoeType" AS ENUM ('RUNNING', 'CASUAL', 'BOOTS', 'FORMAL', 'SLIPPERS', 'BASKETBALL', 'SKATEBOARDING', 'TRAINING', 'HIKING');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "selectedColor" TEXT NOT NULL,
ADD COLUMN     "selectedSize" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedColor" TEXT NOT NULL,
ADD COLUMN     "selectedSize" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId",
ADD COLUMN     "brand" "Brand" NOT NULL,
ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "shoeType" "ShoeType" NOT NULL,
ADD COLUMN     "sizes" TEXT[];

-- CreateTable
CREATE TABLE "SizeStock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SizeStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SizeStock_productId_idx" ON "SizeStock"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SizeStock_productId_size_key" ON "SizeStock"("productId", "size");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- AddForeignKey
ALTER TABLE "SizeStock" ADD CONSTRAINT "SizeStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
