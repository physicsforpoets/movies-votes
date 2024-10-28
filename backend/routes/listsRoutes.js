import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Create List
router.post('/', async (req, res) => {
  const { name, userId } = req.body;
  try {
    const list = await prisma.list.create({ data: { name, userId } });
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get All Lists
router.get('/', async (req, res) => {
  try {
    const lists = await prisma.list.findMany();
    res.status(200).json(lists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get List Details
router.get('/:id', async (req, res) => {
  try {
    const list = await prisma.list.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        movies: {
          include: { services: true },
        },
      },
    });
    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Start Next Voting Round
router.put('/:id/voting/start-next-round', async (req, res) => {
  // TODO: Lock to list owner/admin
  // TODO: Should an active voting round be allowed to skip next? (choosing winner sets active: false)

  const id = req.params.id;
  try {
    const list = await prisma.list.update({
      where: { id, active: true },
      data: {
        votingRound: { increment: 1 },
        votingActive: true,
      },
    });

    // TODO: Push notification

    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Choose Winner, End Round
router.put('/:id/voting/select-movie/:movieId', async (req, res) => {
  // TODO: Lock to list owner/admin

  const id = req.params.id;
  const movieId = req.params.movieId;
  try {
    // TODO: Maybe use transactions for this to rollback both in case either fail:
    // https://www.prisma.io/docs/orm/prisma-client/queries/transactions 

    const selectedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: { watched: true },
    });

    const list = await prisma.list.update({
      where: { id, active: true, votingActive: true },
      data: { votingActive: false },
    });

    // TODO: Push notification

    list.selectedMovie = selectedMovie;
    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get List Movies - DEPRECATED?
router.get('/:id/movies', async (req, res) => {
  // TODO: Move this logic to controllers - call the 'movieController' to get movies for list
  try {
    const movies = await prisma.movie.findMany({
      where: {
        list: {
          id: req.params.id,
        },
      },
      include: {
        services: true,
      },
    });
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get List Standings - DEPRECATED?
router.get('/:id/standings', async (req, res) => {
  // TODO: Move this logic to controllers - call the 'votesController' ??? to get movies for standings
  try {
    const movies = await prisma.movie.findMany({
      where: {
        watched: false,
      },
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: [
        {
          votes: {
            _count: 'desc',
          },
        },
        { sortTitle: 'desc' }
      ],
    });

    // Filter out movies without votes
    // Using '_count' and 'groupBy' and 'include' is apparently not supported
    const filteredMovies = movies.filter(movie => movie?._count?.votes > 0);
    res.status(200).json(filteredMovies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router
