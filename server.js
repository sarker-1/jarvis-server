import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text());

// 🔐 API key from env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  const userInput = req.body;

  // ✅ API key check (IMPORTANT)
  if (!GEMINI_API_KEY) {
    console.log("❌ API key missing");
    return res.send("API key missing");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userInput }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("🔍 Gemini response:", data);

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI reply";

    res.send(aiText);
  } catch (error) {
    console.log("❌ ERROR:", error);
    res.send("Error connecting AI");
  }
});

// 🚀 start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
