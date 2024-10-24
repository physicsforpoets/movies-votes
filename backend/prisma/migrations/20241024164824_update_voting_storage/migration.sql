/*
  Warnings:

  - You are about to drop the column `votingActive` on the `List` table. All the data in the column will be lost.
  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `round` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "votingActive",
ADD COLUMN     "activeVotingRound" INTEGER;

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
ADD COLUMN     "round" INTEGER NOT NULL,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("movieId", "deviceId", "round");
