export default function handler(req, res) {
  // אפשר תמיכה רק ב-POST
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
  }

  // טיפול ב-CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // אפשר להחליף * בדומיין הספציפי שלך
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // טיפול בבקשות OPTIONS (Preflight)
  if (req.method === "OPTIONS") {
      return res.status(200).end();
  }

  res.status(200).json({ message: "API is working with POST!" });
}
