/*
  Warnings:

  - You are about to drop the column `avatarBase64` on the `persons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "persons" DROP COLUMN "avatarBase64";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarBase64" TEXT;
