import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  // TODO: Validate data
  const sortTitle = req.body.title.toLowerCase().indexOf('the ') === 0 ? `${req.body.title.slice(4)}, ${req.body.title.slice(0, 3)}` : req.body.title;

  const data = {
    title: req.body.title,
    sortTitle,
    tmdbId: req.body.tmdbId || null,
    posterUrl: req.body.posterUrl,
    securePosterUrl: req.body.securePosterUrl,
    rating: req.body.rating,
    scary: req.body.scary,
    releaseDate: new Date(req.body.releaseDate).toISOString(),
    description: req.body.description,
    listId: req.body.listId,
  };

  if (req.body.services) {
    data.services = {
      connect: req.body.services.map(id => ({ id })),
    };
  }

  try {
    const movie = await prisma.movie.create({ data });
    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/watched', async (req, res) => {
  const data = {
    watched: req.body.watched || false,
  };
  try {
    const movie = await prisma.movie.update({
      where: { id: req.params.id },
      data,
      include: {
        services: true,
        _count: {
          select: { votes: true }
        },
      },
    });
    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router

