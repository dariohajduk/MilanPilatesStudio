const express = require('express');
const runJestTests = require('../jestRunner');
const router = express.Router();

router.post('/run-tests', async (req, res) => {
  try {
    console.log('Starting test run...');
    const results = await runJestTests();
    console.log('Test run completed successfully');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run tests',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;