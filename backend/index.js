import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a list room when client requests it
  socket.on('join-list', (listId) => {
    const room = `list-${listId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Leave a list room
  socket.on('leave-list', (listId) => {
    const room = `list-${listId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Export io for use in routes via req.app.get('io')
app.set('io', io);

// TODO: Fall through all errors to be handled here

httpServer.listen(port, () => {
  console.log(`App running on port ${port}`)
});
