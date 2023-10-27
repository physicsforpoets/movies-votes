import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const lists = await prisma.list.findMany();
    res.status(200).json(lists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const list = await prisma.list.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        movies: {
          include: {
            services: true,
            _count: {
              select: { votes: true }
            },
          },
        },
      },
    });
    res.status(200).json(list);
  } catch (error) {
    console.error(errro);
    res.status(500).json({ message: error.message });
  }
});

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
})

router.post('/', async (req, res) => {
  const { name, userId } = req.body;
  try {
    const list = await prisma.list.create({ data: { name, userId } });
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router
