const Chat = require("../models/Chat");
const Memory = require("../models/Memory");
const { getEmbedding, cosineSimilarity } = require("../utils/embedding");
const askOnlineModel = require("../utils/onlineModel");
const { exec } = require("child_process");
const persona = require("../config/persona");

const classifyIntent = async (message) => {
  const classifierPrompt = `
You are an intent classifier.


Classify the user's message into ONE of these:

1. CHAT
2. DESKTOP_ACTION
3. SELF_UPDATE

Return JSON only.
If user asks you to change your personality, tone, behavior, mood, speaking style, avatar, name, theme, or UI, classify as SELF_UPDATE.
Examples:
- be more sarcastic
- be kinder
- talk angrily
- become more romantic
- change your profile picture
- make your UI darker

For desktop action:
{
  "intent": "DESKTOP_ACTION",
  "action":" open_app | open_website | search_google | search_youtube | close_app | close_tab | close_window | screenshot | volume_up | volume_down | mute",
  "target": "app name or website name or empty"
}

Rules:
- "search X on google" => action "search_google", target "X"
- "google X" => action "search_google", target "X"
- "search X on youtube" => action "search_youtube", target "X"
- "play X on youtube" => action "search_youtube", target "X"
- "close tab" => action "close_tab"
- "close current tab" => action "close_tab"
- "close window" => action "close_window"
- "close chrome/notepad/vscode" => action "close_app", target app name

If user says search, google, find online, or look up something, use:
{
  "intent": "DESKTOP_ACTION",
  "action": "open_website",
  "target": "search query"
}

For normal chat:
{
  "intent": "CHAT"
}

User message:
"${message}"
`;

// const moodClassifier = async (aiText) => {
//   const moodPrompt = `
// Classify this assistant reply mood.

// Allowed moods:
// neutral, happy, sad, angry, thinking, sleepy, love

// Return only one word.

// Reply:
// "${aiText}"
// `;

//   try {
//     const mood = await askOnlineModel(moodPrompt);

//     return mood
//       .toLowerCase()
//       .replace(/[^a-z]/g, "")
//       .trim();
//   } catch {
//     return "neutral";
//   }
// };

  const response = await fetch(process.env.OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      prompt: classifierPrompt,
      stream: false,
      think: false,
      options: {
        num_predict: 120,
        temperature: 0.1,
      },
    }),
  });

  const data = await response.json();

  try {
    const jsonText = data.response.match(/\{[\s\S]*\}/)?.[0];
    return JSON.parse(jsonText);
  } catch {
    return { intent: "CHAT" };
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    await Chat.create({
      role: "user",
      message,
    });

    const lowerMessage = message.toLowerCase();

    // AI intent classifier
    const intentData = await classifyIntent(message);
    console.log("Intent detected:", intentData);

    if (intentData.intent === "SELF_UPDATE") {
      console.log("Using SELF UPDATE controller");
      
  const response = await fetch("http://localhost:4000/api/self-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      command: message,
    }),
  });

  const data = await response.json();

  return res.status(200).json({
    success: data.success,
    reply: data.message,
  });
}

    if (intentData.intent === "DESKTOP_ACTION") {
      console.log("Using DESKTOP ACTION:", intentData);
      exec(
        `python desktop_controller.py "${intentData.action}" "${intentData.target || ""}"`,
        (error, stdout, stderr) => {
          if (error) console.log(error);
          if (stderr) console.log(stderr);
          console.log(stdout);
        }
      );

      return res.status(200).json({
        success: true,
        reply: "Done Ashutosh.",
      });
    }

    // Auto memory
    const memoryKeywords = [
      "remember that",
      "i am working on",
      "i like",
      "i love",
      "i prefer",
      "my goal is",
      "i want to",
      "i am learning",
      "my project is",
      "my friend",
      "friend name",
      "my",
      "i am",
      "i",
    ];

    const shouldSaveMemory = memoryKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    if (shouldSaveMemory) {
      const memoryEmbedding = await getEmbedding(message);

      await Memory.create({
        text: message,
        category: "auto_memory",
        embedding: memoryEmbedding,
      });

      console.log("Auto memory saved:", message);
    }

    // Semantic memory search
    const questionEmbedding = await getEmbedding(message);

    const allMemories = await Memory.find({
      embedding: { $exists: true, $ne: [] },
    });

    const scoredMemories = allMemories
      .map((memory) => ({
        memory,
        score: cosineSimilarity(questionEmbedding, memory.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const memories = scoredMemories.map((item) => item.memory);

    const memoryText = memories
      .map((memory, index) => `${index + 1}. ${memory.text}`)
      .join("\n");

    const recentChats = await Chat.find()
      .sort({ createdAt: -1 })
      .limit(8);

    const conversationText = recentChats
      .reverse()
      .map((chat) =>
        `${chat.role === "user" ? "Ashutosh" : "Aditi"}: ${chat.message}`
      )
      .join("\n");

    const prompt = `
You are ${persona.assistantName}, ${persona.userName}'s personal AI companion.

Personality:
${persona.personality}

Saved memories:
${memoryText || "No memories yet."}

Recent conversation:
${conversationText || "No recent conversation."}

${persona.userName}: ${message}
${persona.assistantName}:
`;

let aiReply = "";

try {
  if (process.env.USE_ONLINE_MODEL === "true") {
    console.log("Using ONLINE model:", process.env.ONLINE_MODEL);
    aiReply = await askOnlineModel(prompt);
  } else {
    console.log("Using LOCAL fallback model:", process.env.OLLAMA_MODEL);
    const response = await fetch(process.env.OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt,
        stream: false,
        think: false,
        options: {
          num_predict: 180,
          temperature: 0.85,
          repeat_penalty: 1.25,
          top_p: 0.9,
        },
      }),
    });



    const data = await response.json();
    aiReply = data.response || data.error || "No response from local AI";
  }
} catch (error) {
  console.log("Online model failed. Using local fallback.");

  const response = await fetch(process.env.OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      prompt,
      stream: false,
      think: false,
    }),
  });

  const data = await response.json();
  aiReply = data.response || data.error || "No response from fallback AI";
}
// const mood = await moodClassifier(aiReply);

  await new Promise((resolve, reject) => {

  exec(
    `python tts.py "${aiReply.replace(/"/g, '')}"`,
    (error) => {

      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve();
      }
    }
  );

});
    await Chat.create({
      role: "assistant",
      message: aiReply,
    });

    return res.status(200).json({
      success: true,
      reply: aiReply,
      audio: "http://localhost:4000/audio/output.mp3",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ createdAt: 1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch chat history",
    });
  }
};