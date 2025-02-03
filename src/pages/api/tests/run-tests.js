export default function handler(req, res) {
  // הוספת כותרות CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // או רשום דומיין ספציפי במקום *
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // אם הבקשה היא OPTIONS (Preflight), החזר 200 וסיים
  if (req.method === 'OPTIONS') {
      return res.status(200).end();
  }

  // החזרת תשובת JSON רגילה
  res.status(200).json({ message: "API is working on Vercel!" });
}
