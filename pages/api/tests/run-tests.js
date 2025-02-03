export default function handler(req, res) {
  // טיפול בבקשות OPTIONS (Preflight)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // ניתן להחליף * בדומיין ספציפי
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); // לא כולל GET
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  // אפשר תמיכה רק ב-POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // טיפול ב-CORS (למקרה שהשרת מחזיר תגובה ללא OPTIONS)
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.status(200).json({ message: "API is working with POST!" });
}
