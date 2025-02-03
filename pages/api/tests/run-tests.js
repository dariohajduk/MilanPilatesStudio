import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  // מסלול לקבצי הבדיקות
  const testPath = path.join(process.cwd(), 'src/tests');

  exec(`npx jest ${testPath} --json --ci`, (error, stdout) => {
    if (error) {
      console.error(`Test run error: ${error}`);
      return res.status(500).json({ error: `Failed to run tests: ${error.message}` });
    }

    try {
      const results = JSON.parse(stdout);
      res.status(200).json(results);
    } catch (parseError) {
      res.status(500).json({ error: `Error parsing test results: ${parseError.message}` });
    }
  });
}
