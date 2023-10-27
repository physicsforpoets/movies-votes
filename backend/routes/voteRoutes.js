import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/mine', async (req, res) => {
  if (!res.locals.deviceId) {
    res.status(500).json({ message: 'Unknown device.' });
    return;
  }

  try {
    const votes = await prisma.vote.findMany({
      where: {
        deviceId: res.locals.deviceId,
      },
      select: {
        movieId: true,
      },
    });

    // Just return an array of movie IDs
    const votesParsed = { votes: votes.map(vote => vote.movieId) };
    res.status(200).json(votesParsed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:movieId', async (req, res) => {
  if (!res.locals.deviceId) {
    res.status(500).json({ message: 'Unknown device.' });
    return;
  }

  const data = {
    movieId: req.params.movieId,
    deviceId: res.locals.deviceId,
  };

  try {
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

router.delete('/:movieId', async (req, res) => {
  if (!res.locals.deviceId) {
    res.status(500).json({ message: 'Unknown device.' });
    return;
  }

  try {
    // NOTE:
    // .delete() wasn't working here for some reason - probably the composite key
    const vote = await prisma.vote.deleteMany({
      where: {
        movieId: req.params.movieId,
        deviceId: res.locals.deviceId,
      },
    });
    res.status(200).json(vote);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router
