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
    });
    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/movies', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      where: { listId: req.params.id },
      include: { services: true },
    });
    res.status(200).json(movies);
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

// Choose Winner by Movie ID, End Round - DEPRECATED
router.put('/:id/voting/select-movie/:movieId', async (req, res) => {
  // TODO: Lock to list owner/admin

  const id = req.params.id;
  const movieId = req.params.movieId;
  try {
    // TODO: Maybe use transactions for this to rollback both in case either fail:
    // https://www.prisma.io/docs/orm/prisma-client/queries/transactions 

    // TODO: Update 'round watched'
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

// Choose winner by most votes, random if tie, end round
router.put('/:id/voting/pick-winner', async (req, res) => {
  // TODO: Lock to list owner/admin
  
  const listId = req.params.id;
  try {
    // Get active round for list, if any, then pull vote counts and then winning movie info, randomizing on ties
    // Needs to be split up, Prisma doesn't seem to be able to handle subqueries or complex joins in a groupBy

    const list = await prisma.list.findFirstOrThrow({
      where: { id: listId }
    });

    if (!list.votingActive || !list.votingRound) {
      return res.status(500).json({ message: 'Voting not active for this list.' });
    }

    // Get vote counts, rounds, and movieIds, then pull movie info. 
    // Prisma doesn't appear to be able to combine these to a single query.
    const votes = await prisma.vote.groupBy({
      by: ['round', 'movieId'],
      where: { 
        movie: { listId },
        round: list.votingRound,
      },
      _count: { _all: true },
      orderBy: [
        { _count: { movieId: 'desc' } },
      ],
    });

    if (!votes || !votes.length) {
      return res.status(500).json({ message: 'No votes for this round.' });
    }

    // Rows will be in a descending vote count order, loop until next entry count is less than existing entry/entries
    let mostVotes = [];
    for (let i = 0; i < votes.length; i++) {
      const nextRow = {
        movieId: votes[i].movieId,
        count: votes[i]._count._all,
      };

      if (!mostVotes.length || nextRow.count === mostVotes[i - 1].count) {
        mostVotes.push(nextRow);
      } else {
        break;
      }
    }

    const winningEntry = mostVotes[Math.floor(Math.random() * mostVotes.length)];


    // TODO: Check if movie has already been watched
    const movie = await prisma.movie.update({
      where: { id: winningEntry.movieId },
      data: { roundWatched: list.votingRound },
    });

    await prisma.list.update({
      where: { id: list.id, active: true, votingActive: true },
      data: { votingActive: false },
    });

    // TODO: Push notification
    
    res.status(200).json(movie);
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
