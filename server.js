import express from "express";

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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userInput }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    if (data.error) {
      return res.send("Gemini API error");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI reply";

    res.send(text);

  } catch (err) {
    res.send("Server error");
  }
});

app.listen(3000, () => console.log("Running"));
