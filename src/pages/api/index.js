const express = require('express');
const cors = require('cors');
const testRoutes = require('./tests'); // Adjusted path

const app = express();

app.use(cors({
  origin: [
    'https://milan-pilates-studio.vercel.app', // Production
    /\.vercel\.app$/, // Allow Vercel preview deployments
    'http://localhost:3000' // Development
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/tests', testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export as a Vercel serverless function
module.exports = app;
