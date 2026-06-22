import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.raw({ type: "*/*", limit: "5mb" }));

// 🎤 VOICE → TEXT → AI
app.post("/voice", async (req, res) => {
  const audio = req.body;

  try {
    // 🎤 Deepgram Speech-to-Text
    const dg = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/wav"
      },
      body: audio
    });

    const dgData = await dg.json();

    const text =
      dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    console.log("🎤 Speech:", text);

    if (!text) return res.send("");

    // 🔥 Wake word check
    if (text.toLowerCase().includes("jarvis")) {
      return res.send("Yes Sir 🎧");
    }

    // 🤖 OpenRouter AI
    const ai = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: text }]
      })
    });

    const aiData = await ai.json();

    const reply =
      aiData?.choices?.[0]?.message?.content || "Sorry Sir";

    console.log("🤖 AI:", reply);

    res.send(reply);

  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

// 🔊 Health check
app.get("/", (req, res) => {
  res.send("JARVIS VOICE AI RUNNING 🔥");
});

app.listen(3000, () => {
  console.log("🚀 Server running");
});
