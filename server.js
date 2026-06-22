import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  const userInput = req.body;

  // ✅ API key check
  if (!GEMINI_API_KEY) {
    console.log("❌ API key missing");
    return res.send("API key missing");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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

    // 🔍 DEBUG (VERY IMPORTANT)
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    // ✅ safe response extract
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI reply";

    res.send(aiText);
  } catch (error) {
    console.log("❌ ERROR:", error);
    res.send("Error connecting AI");
  }
});

// 🔥 default route (browser test)
app.get("/", (req, res) => {
  res.send("JARVIS server running ✅");
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
