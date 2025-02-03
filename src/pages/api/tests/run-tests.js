export default function handler(req, res) {
  // טיפול ב-CORS
  res.setHeader("Access-Control-Allow-Origin", "*");  // אפשר להחליף * בדומיין שלך
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // טיפול בבקשת OPTIONS (Preflight Request)
  if (req.method === "OPTIONS") {
      return res.status(200).end();
  }

  res.status(200).json({ message: "API is working on Vercel!" });
}
