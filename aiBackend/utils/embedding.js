const getEmbedding = async (text) => {
  const response = await fetch(process.env.EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  const data = await response.json();

  return data.embedding;
};

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  return dot / (magA * magB);
};

module.exports = {
  getEmbedding,
  cosineSimilarity,
};
