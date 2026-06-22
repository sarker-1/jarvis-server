import express from "express";
import fetch from "node-fetch";

const app = express();

// 🎤 raw (voice)
app.use(express.raw({ type: "*/*", limit: "5mb" }));

// 🔤 text
app.use(express.text());

// ==========================
// 💬 TEXT → AI
// ==========================
app.post("/chat", async (req, res) => {
  try {
    let text = req.body;

    // 🔥 FIX: buffer → string
    if (Buffer.isBuffer(text)) {
      text = text.toString("utf-8");
    }

    text = text.trim();

    if (!text) return res.send("Empty");

    console.log("💬 Text:", text);

    const aiRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            {
              role: "user",
              content: text,
            },
          ],
        }),
      }
    );

    const aiData = await aiRes.json();

    console.log("🧠 AI RAW:", aiData);

    const reply =
      aiData?.choices?.[0]?.message?.content || "Sorry Sir";

    res.send(reply);

  } catch (err) {
    console.log("❌ CHAT ERROR:", err);
    res.send("Chat Error");
  }
});

// ==========================
// 🎤 VOICE → TEXT → AI
// ==========================
app.post("/voice", async (req, res) => {
  try {
    const audio = req.body;

    if (!audio || audio.length === 0) {
      return res.send("No audio");
    }

    // 🎤 Deepgram STT
    const dg = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/wav",
      },
      body: audio,
    });

    const dgData = await dg.json();

    const text =
      dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    console.log("🎤 Speech:", text);

    if (!text) return res.send("");

    // 🔥 Wake word
    if (text.toLowerCase().includes("jarvis")) {
      return res.send("Yes Sir 🎧");
    }

    // 🤖 AI
    const aiRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            {
              role: "user",
              content: text,
            },
          ],
        }),
      }
    );

    const aiData = await aiRes.json();

    console.log("🧠 AI RAW:", aiData);

    const reply =
      aiData?.choices?.[0]?.message?.content || "Sorry Sir";

    console.log("🤖 AI:", reply);

    res.send(reply);

  } catch (err) {
    console.log("❌ VOICE ERROR:", err);
    res.send("Voice Error");
  }
});

// ==========================
// 🧪 Health check
// ==========================
app.get("/", (req, res) => {
  res.send("JARVIS AI RUNNING 🔥");
});

// ==========================
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
