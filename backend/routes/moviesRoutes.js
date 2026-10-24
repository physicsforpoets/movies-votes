import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  // TODO: Validate data
  try {
    const sortTitle = req.body.title.toLowerCase().indexOf('the ') === 0 ? `${req.body.title.slice(4)}, ${req.body.title.slice(0, 3)}` : req.body.title;

    const data = {
      title: req.body.title,
      sortTitle,
      tmdbId: parseInt(req.body.tmdbId, 10) || null,
      posterUrl: req.body.posterUrl || null,
      securePosterUrl: req.body.securePosterUrl || null,
      trailerUrl: req.body.trailerUrl || null,
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

    const movie = await prisma.movie.create({ data });
    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router

