/*
  Warnings:

  - You are about to drop the `MoviesOnServices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MoviesOnServices" DROP CONSTRAINT "MoviesOnServices_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MoviesOnServices" DROP CONSTRAINT "MoviesOnServices_serviceId_fkey";

-- DropTable
DROP TABLE "MoviesOnServices";

-- CreateTable
CREATE TABLE "_MovieToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToService_AB_unique" ON "_MovieToService"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToService_B_index" ON "_MovieToService"("B");

-- AddForeignKey
ALTER TABLE "_MovieToService" ADD CONSTRAINT "_MovieToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToService" ADD CONSTRAINT "_MovieToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
