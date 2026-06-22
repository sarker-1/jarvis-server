import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  const userInput = req.body;

  if (!GEMINI_API_KEY) {
    return res.send("API key missing");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY, // 🔥 IMPORTANT CHANGE
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

    console.log("🔍 Gemini response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.send("Gemini API error");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI reply";

    res.send(text);

  } catch (error) {
    console.log(error);
    res.send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
