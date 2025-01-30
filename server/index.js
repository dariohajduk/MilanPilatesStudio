const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/tests'); // Import the test routes

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tests', testRoutes); // Mount test routes

// Default route for debugging
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
