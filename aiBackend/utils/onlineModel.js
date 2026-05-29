const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const askOnlineModel = async (prompt) => {
  const completion = await client.chat.completions.create({
    model: process.env.ONLINE_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.85,
    max_tokens: 300,
  });

  return completion.choices[0].message.content;
};

module.exports = askOnlineModel;