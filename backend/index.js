import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import { v4 as uuidv4 } from 'uuid';

import favoritesRoutes from './routes/favoritesRoutes.js';
import listsRoutes from './routes/listsRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import moviesRoutes from './routes/moviesRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import votesRoutes from './routes/votesRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// TODO: Auth protect 'admin' routes
// TODO: If using client side device id, add device id check middleware

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());

// HEY this doesn't work on iOS
// app.use((req, res, next) => {
//   const deviceId = req.cookies.deviceId;
//   if (!deviceId) {
//     const deviceId = uuidv4();
//     const maxAge = 1000 * 60 * 60 * 24 * 3; // 3 Day expry
//     res.locals.deviceId = deviceId;
//     res.cookie('deviceId', deviceId, { 
//       maxAge,
//       sameSite: 'none',
//       secure: 'false',
//       domain: 'halloweenflicks.com',
//     });
//   } else {
//     res.locals.deviceId = deviceId;
//   }
//   next();
// });

app.use((req, res, next) => {
  // Check for deviceId header on every request
  const deviceId = req.get('X-STAT-deviceId');
  if (!deviceId) {
    res.status(500).json({ message: 'Unknown device.' });
    return;
  }
  next();
});

// Routes
app.use('/api/favorites', favoritesRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/votes', votesRoutes);

// TODO: Fall through all errors to be handled here

app.listen(port, () => {
  console.log(`App running on port ${port}`)
});
