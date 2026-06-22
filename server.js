import express from "express";
import fs from "fs";

const app = express();
app.use(express.text({ limit: "1mb" }));

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🧠 Memory
let history = [
  {
    role: "system",
    content:
      "You are Jarvis, a smart AI assistant. Speak in Bangla and English mix. Be respectful and call user 'Sir'."
  }
];

// 💾 save memory
function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(history, null, 2));
}

// 🔥 WAKE WORD DETECTOR
function isWakeWord(text) {
  text = text.toLowerCase();
  return text.includes("jarvis");
}

// 🤖 MAIN AI
app.post("/ai", async (req, res) => {
  const userInput = req.body;

  // 👉 wake word check
  if (isWakeWord(userInput)) {
    return res.send("Yes Sir 🎧");
  }

  try {
    history.push({ role: "user", content: userInput });

    if (history.length > 10) {
      history.splice(1, 2);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: history
      })
    });

    const data = await response.json();

    const aiText =
      data?.choices?.[0]?.message?.content || "No reply";

    history.push({ role: "assistant", content: aiText });
    saveMemory();

    res.send(aiText);

  } catch (err) {
    console.log(err);
    res.send("Server error");
  }
});

// 🔊 SPEAKER
app.get("/speak", (req, res) => {
  const text = req.query.text || "Yes Sir";

  const url =
    "https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=" +
    encodeURIComponent(text);

  res.send(url);
});

// 🔥 SERVER
app.listen(3000, () => {
  console.log("🚀 Jarvis server running");
});
