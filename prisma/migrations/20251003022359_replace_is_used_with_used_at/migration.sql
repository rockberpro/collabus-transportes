/*
  Warnings:

  - You are about to drop the column `isUsed` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "isUsed",
ADD COLUMN     "usedAt" TIMESTAMP(3);
