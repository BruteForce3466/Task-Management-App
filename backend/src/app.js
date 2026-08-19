const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const db = require('./db');

const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Healthcheck endpoint (Section 2 Requirement)
app.get('/health', async (req, res) => {
  try {
    // Optionally check DB connectivity
    await db.query('SELECT 1');
    return res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (err) {
    console.error('Healthcheck DB connection error:', err.message);
    return res.status(503).json({ status: 'DOWN', error: err.message });
  }
});

// API Routes
app.use('/api/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
