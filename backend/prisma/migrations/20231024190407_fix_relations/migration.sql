/*
  Warnings:

  - You are about to drop the `ListsOnMovies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `listId` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ListsOnMovies" DROP CONSTRAINT "ListsOnMovies_listId_fkey";

-- DropForeignKey
ALTER TABLE "ListsOnMovies" DROP CONSTRAINT "ListsOnMovies_movieId_fkey";

-- DropForeignKey
ALTER TABLE "ListsOnMovies" DROP CONSTRAINT "ListsOnMovies_userId_fkey";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "listId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ListsOnMovies";

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
