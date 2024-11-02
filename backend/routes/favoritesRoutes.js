import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * TODO: Rest design overthinking stuff...
 * - Should POSTing a favorite always depend on the device id in the header?
 *   - What about an admin type tool that can let a superuser modify any and all data?
 *   - Should there be a separate POST to add to 'my' favorites? 
 *   - Same for GETs, and pretty much every other call in this dang app
 * - URL path params VS. body JSON
 *   - POST /favorite/123456 or POST /favorite { movieId: 123456 }
 */

router.post('/', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  const movieId = req.body?.movieId;
  if (!movieId) {
    res.status(500).json({ message: 'Unknown movie.' });
    return;
  }

  const data = { movieId, deviceId };

  try {
    const favorite = await prisma.favorite.create({ data });
    // NOTE: Should this return all favorites every POST?
    res.status(200).json(favorite);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
    ) {
      // Ignore dupe failure error, could be race conditions
      res.status(200).json(data);
    } else {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete('/movie-id/:movieId', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  try {
    // NOTE:
    // .delete() wasn't working here for some reason - probably the composite key
    const favorite = await prisma.favorite.deleteMany({
      where: {
        movieId: req.params.movieId,
        deviceId,
      },
    });
    res.status(200).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/list/:listId/mine', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  const listId = req.params.listId;
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        deviceId,
        movie: { listId },
      },
      include: {
        movie: true,
      }
    });

    // Just return IDs...
    const favoriteIDs = favorites.reduce((acc, favorite) => {
      acc.push(favorite.movieId);
      return acc;
    }, []);

    res.status(200).json(favorites.map(movie => movie.movie));
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router
