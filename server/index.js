const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/tests');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with OPTIONS included
app.use(cors({
  origin: [
    'https://milan-pilates-studio.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Explicitly handle OPTIONS requests (preflight)
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
