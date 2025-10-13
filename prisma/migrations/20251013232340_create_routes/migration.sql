/*
  Warnings:

  - Made the column `isActive` on table `routes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `routes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `routes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;
