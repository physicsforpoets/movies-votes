import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/movie/:movieId/round/active', async (req, res) => {
  const movieId = req.params.movieId;
  const deviceId = req.get('X-STAT-deviceId');

  let data;
  try {
      // Check that movie's list is active and voting is active, get active round
      // NOTE: Raw query with subquery for round # could be more efficient than 2 queries
      const movie = await prisma.movie.findFirstOrThrow({
        where: {
          id: movieId,
          list: {
            active: true,
            votingActive: true,
            votingRound: { gt: 0 },
          },
        },
        include: { list: true },
      });

      data = {
        deviceId,
        movieId,
        round: movie.list.votingRound,
      };

      // TODO: Push client notification

      const vote = await prisma.vote.create({ data });
      res.status(200).json(vote);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
    ) {
      // Ignore dupes, could be race conditions
      res.status(200).json(data);
    } else {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
});

router.get('/mine', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  try {
    const votes = await prisma.vote.findMany({
      where: { deviceId },
      orderBy: { round: 'desc' },
      include: { movie: true },
    });
    res.status(200).json(votes);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router
