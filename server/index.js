const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/tests');

const app = express();
const PORT = process.env.PORT || 5000;

// Update the CORS configuration
app.use(cors({
  origin: [
    'https://milan-pilates-studio.vercel.app', // Main Vercel deployment
    'https://milan-pilates-studio-45u6hy3uz-darios-projects-1e6da2f9.vercel.app', // Temporary Vercel preview deployment
    'http://localhost:3000' // Local development
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Explicitly handle preflight requests
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
