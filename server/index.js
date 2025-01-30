const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/tests');

const app = express();
const PORT = 5000;

// Configure CORS
app.use(cors({
  origin: ['https://milan-pilates-studio.vercel.app, 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  credentials: true
}));

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