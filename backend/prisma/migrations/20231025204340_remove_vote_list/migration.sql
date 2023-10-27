/*
  Warnings:

  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `sortTitle` on table `Movie` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_listId_fkey";

-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "sortTitle" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
ALTER COLUMN "listId" DROP NOT NULL,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("movieId", "deviceId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;
