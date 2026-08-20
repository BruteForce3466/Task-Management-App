const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const db = require('./db');

const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Request logging middleware for troubleshooting & docker logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Healthcheck endpoint (Section 2 Requirement)
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'UP' });
});

// API Routes
app.use('/api/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
  console.warn(`[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled Server Error:`, err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
