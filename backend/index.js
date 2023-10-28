import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

import listRoutes from './routes/listRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// TODO: Auth protect 'admin' routes

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const deviceId = req.cookies.deviceId;
  if (!deviceId) {
    const deviceId = uuidv4();
    const maxAge = 1000 * 60 * 60 * 24 * 3; // 3 Day expry
    res.locals.deviceId = deviceId;
    res.cookie('deviceId', deviceId, { 
      maxAge,
      sameSite: 'none',
      secure: 'false',
    });
  } else {
    res.locals.deviceId = deviceId;
  }
  next();
});

// Routes
app.use('/api/lists', listRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);

app.listen(port, () => {
  console.log(`App running on port ${port}`)
});
