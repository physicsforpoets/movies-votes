import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Post vote in active voting round.
 * List ID attached to movie.
 */
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

router.post('/round/active', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  const movieIds = req.body.movieIds;
  const response = [];

  for (const i in movieIds) {
    const movieId = movieIds[i];
    console.log('trying movieId', movieId);
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
  
      const data = {
        deviceId,
        movieId,
        round: movie.list.votingRound,
      };
  
      // TODO: Push client notification
      response.push({ ...data, movie });
      await prisma.vote.create({ data });
    } catch (error) {
      if (
        ! error instanceof Prisma.PrismaClientKnownRequestError
        || error.code !== 'P2002'
      ) {
        console.error(error);
        res.status(400).json({ message: error.message });
      }
    }
  }

  res.status(200).json(response);
})

/**
 * Get user's votes for list ID.
 */
router.get('/list/:listId/mine', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  const listId = req.params.listId;
  try {
    const votes = await prisma.vote.findMany({
      where: { 
        deviceId,
        movie: { listId },
      },
      orderBy: { round: 'desc' },
      include: { movie: true },
    });
    res.status(200).json(votes);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get user's votes for list ID.
 */
router.get('/list/:listId/mine/active-round', async (req, res) => {
  const deviceId = req.get('X-STAT-deviceId');
  const listId = req.params.listId;
  try {
    const list = await prisma.list.findFirstOrThrow({ id: listId });
    if (!list.votingActive) {
      // if voting not active, just return an empty array
      return res.status(200).json([]);
    }

    const votes = await prisma.vote.findMany({
      where: { 
        deviceId,
        round: list.votingRound,
        movie: { listId },
      },
      orderBy: { round: 'desc' },
      include: { movie: true },
    });
    res.status(200).json(votes);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get voting results for list ID.
 */
router.get('/list/:listId/results', async (req, res) => {
  /**
   * Raw query is more efficient:
      SELECT round, "Vote"."movieId", "Movie".title, "Movie"."roundWatched", count(*) AS votes
      FROM "Vote"
      LEFT JOIN "Movie" ON "Movie".id = "Vote"."movieId"
      GROUP BY "movieId", round, title, "roundWatched"
      ORDER BY round DESC, votes DESC
   */
  const listId = req.params.listId;
  try {
    // Get vote counts, rounds, and movieIds, then pull movie info. 
    // Prisma doesn't appear to be able to combine these to a single query.
    const votes = await prisma.vote.groupBy({
      by: ['round', 'movieId'],
      where: { movie: { listId } },
      _count: { _all: true },
      orderBy: [
        { round: 'desc' },
        { _count: { movieId: 'desc' } },
      ],
    });
    
    // grab unique movieIds
    const movieIds = votes.reduce((acc, row) => {
      if (!acc.includes(row.movieId)) {
        acc.push(row.movieId);
      }
      return acc;
    }, []);

    // NOTE: Do I need this? All of the movies will presumably be in the movie store, data updated by push
    //       Should I just have a voting round table with a winner?
    //       This assumes movie store is _always_ up to date, probably fine as long as no changes after voting starts
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        sortTitle: true,
        posterUrl: true,
        securePosterUrl: true,
        rating: true,
        roundWatched: true,
        scary: true,
        releaseDate: true,
      },
      where: {
        id: { in: movieIds },
      },
    });

    const moviesParsed = movies.reduce((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {});

    let results = [];
    for (const i in votes) {
      const vote = votes[i];
      const idx = vote.round - 1;
      const movie = moviesParsed[vote.movieId];
      
      if (!results[idx]) {
        results[idx] = {
          round: vote.round,
          watchedMovieId: null,
          watchedMovie: null,
          votes: [],
        };
      }

      if (movie.roundWatched === vote.round) {
        results[idx].watchedMovieId = vote.movieId;
        results[idx].watchedMovie = movie;
      }

      results[idx].votes.push({
        movieId: vote.movieId,
        votes: vote._count._all,
        movie,
      });
    }

    results = results.sort((a, b) => {
      return a.round < b.round ? 1 : -1;
    });

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

export default router
