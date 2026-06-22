import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  const userInput = req.body;

  if (!GEMINI_API_KEY) {
    console.log("❌ API key missing");
    return res.send("API key missing");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userInput }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔍 debug
    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

    // ⚠️ error handle (important)
    if (data.error) {
      console.log("❌ Gemini error:", data.error);
      return res.send("Gemini API error");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI reply";

    res.send(text);
  } catch (error) {
    console.log("❌ SERVER ERROR:", error);
    res.send("Error connecting AI");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
