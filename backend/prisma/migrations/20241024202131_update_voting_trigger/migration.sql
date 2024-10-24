/*
  Warnings:

  - You are about to drop the column `activeVotingRound` on the `List` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "activeVotingRound",
ADD COLUMN     "votingActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "votingRound" INTEGER NOT NULL DEFAULT 0;
