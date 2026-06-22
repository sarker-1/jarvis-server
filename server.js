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
      "You are Jarvis, a smart AI assistant. Speak in Bangla and English mix. Call the user Sir."
  }
];

// 🎯 Modes
let commandMode = false;
let lastWakeTime = 0;

// 💾 save memory
function saveMemory() {
  fs.writeFileSync("memory.json", JSON.stringify(history, null, 2));
}

// 🔥 Clean text (noise filter)
function cleanText(text) {
  if (!text) return "";
  return text.toLowerCase().trim();
}

// 🔥 wake word detect (improved)
function isWakeWord(text) {
  text = cleanText(text);
  return text.includes("jarvis");
}

// 🔥 device commands
function handleDeviceCommand(text) {
  text = cleanText(text);

  if (text.includes("light on")) return "💡 Light turned ON";
  if (text.includes("light off")) return "💡 Light turned OFF";
  if (text.includes("fan on")) return "🌀 Fan turned ON";
  if (text.includes("fan off")) return "🌀 Fan turned OFF";

  return null;
}

// 🤖 MAIN ROUTE
app.post("/ai", async (req, res) => {
  let userInput = req.body;
  userInput = cleanText(userInput);

  if (!userInput || userInput.length < 2) {
    return res.send(""); // ignore noise
  }

  const now = Date.now();

  // 🎤 WAKE WORD
  if (isWakeWord(userInput)) {
    // prevent spam trigger (2 sec gap)
    if (now - lastWakeTime > 2000) {
      commandMode = true;
      lastWakeTime = now;
      return res.send("Yes Sir 🎧");
    } else {
      return res.send("");
    }
  }

  // ❌ ignore if not in command mode
  if (!commandMode) {
    return res.send("");
  }

  try {
    // 🔌 device command first
    const deviceResponse = handleDeviceCommand(userInput);
    if (deviceResponse) {
      commandMode = false;
      return res.send(deviceResponse);
    }

    // 🤖 AI processing
    history.push({ role: "user", content: userInput });

    if (history.length > 10) {
      history.splice(1, 2);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: history
        })
      }
    );

    const data = await response.json();

    const aiText =
      data?.choices?.[0]?.message?.content || "Sorry Sir";

    history.push({ role: "assistant", content: aiText });
    saveMemory();

    commandMode = false;

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

// 📱 STATUS
app.get("/", (req, res) => {
  res.send("JARVIS ACTIVE 🚀");
});

// 🚀 START
app.listen(3000, () => {
  console.log("🔥 Jarvis server running");
});
