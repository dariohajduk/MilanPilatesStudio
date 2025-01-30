const express = require('express');
const runJestTests = require('../jestRunner');
const router = express.Router();

// Add both GET and POST handlers
router.get('/run-tests', async (req, res) => {
  try {
    const results = await runJestTests();
    res.status(200).json(results);
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Failed to run tests' });
  }
});

router.post('/run-tests', async (req, res) => {
  try {
    const results = await runJestTests();
    res.status(200).json(results);
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Failed to run tests' });
  }
});

module.exports = router;