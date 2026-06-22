import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(express.text({ limit: "1mb" }));

const API_KEY = process.env.OPENROUTER_API_KEY;

let history = [
  {
    role: "system",
    content:
      "You are Jarvis, a smart AI assistant. Speak Bangla + English mix. Call the user Sir."
  }
];

let commandMode = false;

function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(history, null, 2));
}

function isWakeWord(text) {
  return text.toLowerCase().includes("jarvis");
}

function handleDeviceCommand(text) {
  text = text.toLowerCase();

  if (text.includes("light on")) return "💡 Light turned ON";
  if (text.includes("light off")) return "💡 Light turned OFF";

  return null;
}

app.post("/ai", async (req, res) => {
  const userInput = req.body;

  console.log("📩 Input:", userInput);

  if (!API_KEY) {
    return res.send("API key missing");
  }

  if (isWakeWord(userInput)) {
    commandMode = true;
    return res.send("Yes Sir 🎧");
  }

  if (!commandMode) {
    return res.send("");
  }

  try {
    const device = handleDeviceCommand(userInput);
    if (device) {
      commandMode = false;
      return res.send(device);
    }

    history.push({ role: "user", content: userInput });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-app.com",
          "X-Title": "Jarvis ESP"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: history
        })
      }
    );

    const data = await response.json();

    console.log("🧠 AI:", data);

    const aiText =
      data?.choices?.[0]?.message?.content || "Sorry Sir";

    history.push({ role: "assistant", content: aiText });
    saveMemory();

    commandMode = false;

    res.send(aiText);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.send("Server error");
  }
});

app.get("/", (req, res) => {
  res.send("JARVIS ACTIVE 🚀");
});

app.listen(3000, () => {
  console.log("🔥 Jarvis running");
});
