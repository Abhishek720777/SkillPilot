require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./db/connect');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] }
});

app.set('io', io);
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const rateLimit = require('express-rate-limit');

// General API limit: 200 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict code execution limit: 10 requests per 1 minute
const executeLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  message: { error: 'Execution limit reached (max 10 runs per minute).' }
});

// Auth limit to prevent brute force: 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

connectDB().then(() => {
  // Apply the general limiter to all API routes
  app.use('/api', apiLimiter);

  // Apply stricter limiters to specific paths
  app.use('/api/auth',        authLimiter, require('./routes/auth'));
  app.use('/api/quiz',        require('./routes/quiz'));
  app.use('/api/battle',      require('./routes/battle'));
  app.use('/api/leaderboard', require('./routes/leaderboard'));
  app.use('/api/profile',     require('./routes/profile'));
  app.use('/api/chat',        require('./routes/chat'));
  app.use('/api/users',       require('./routes/users'));
  app.use('/api/execute',     executeLimiter, require('./routes/execute'));
  require('./socket/handlers')(io);

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(e => { console.error('DB connection failed:', e); process.exit(1); });
