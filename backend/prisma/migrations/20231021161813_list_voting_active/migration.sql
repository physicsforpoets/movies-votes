/*
  Warnings:

  - Made the column `userId` on table `List` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_userId_fkey";

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "votingActive" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
