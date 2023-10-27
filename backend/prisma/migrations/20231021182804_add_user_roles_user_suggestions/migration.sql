-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "ListsOnMovies" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE "ListsOnMovies" ADD CONSTRAINT "ListsOnMovies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
