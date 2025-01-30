const { exec } = require('child_process');

const runJestTests = () => {
  return new Promise((resolve, reject) => {
    // Use the full command with proper environment and configuration
    const command = 'npx jest --env=jest-environment-jsdom --json';

    console.log('Executing Jest command:', command);

    exec(command, {
      maxBuffer: 1024 * 1024 * 10, // Increase buffer size to 10MB
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: 'true'
      }
    }, (error, stdout, stderr) => {
      if (stderr) {
        console.error('Jest stderr:', stderr);
      }

      if (error && !stdout) {
        console.error('Error executing Jest:', error);
        reject(error);
        return;
      }

      try {
        const results = JSON.parse(stdout);
        resolve({
          success: true,
          numTotalTests: results.numTotalTests,
          numPassedTests: results.numPassedTests,
          numFailedTests: results.numFailedTests,
          testResults: results.testResults.map(suite => ({
            name: suite.name,
            status: suite.status,
            assertionResults: suite.assertionResults,
            failureMessage: suite.message
          }))
        });
      } catch (parseError) {
        console.error('Error parsing Jest output:', parseError);
        reject(parseError);
      }
    });
  });
};

module.exports = runJestTests;