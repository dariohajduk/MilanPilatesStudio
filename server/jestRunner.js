const { exec } = require('child_process');

const runJestTests = () => {
  return new Promise((resolve, reject) => {
    exec('npx jest --env=jest-environment-jsdom --json', { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (stderr) {
        console.error('Jest stderr:', stderr);
      }

      if (error) {
        console.error('Error executing Jest:', error);
        reject(error);
        return;
      }

      try {
        const results = JSON.parse(stdout);
        resolve(results);
      } catch (parseError) {
        console.error('Error parsing Jest output:', parseError);
        reject(parseError);
      }
    });
  });
};

module.exports = runJestTests;