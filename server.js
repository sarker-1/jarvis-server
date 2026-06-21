import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  const userInput = req.body;

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

    // 🔥 IMPORTANT LINE
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No AI reply";

    res.send(aiText); // 👈 plain text send
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
