import express from 'express';
import TMDBUtil from '../util/TMDBUtil.js';

const router = express.Router();
const tmdbUtil = new TMDBUtil(process.env.TMDB_KEY);

router.get('/search/movie', async (req, res) => {
  const results = await tmdbUtil.searchMovie(req.query.query);
  res.json(results);
});

router.get('/movie/:id', async (req, res) => {
  const append = req.query.append || null;
  const result = await tmdbUtil.getMovie(req.params.id, { append });
  res.json(result);
});

export default router;
