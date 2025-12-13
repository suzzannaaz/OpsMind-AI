import SopChunk from "../models/sopChunk.js";
import { getEmbedding } from "./embed.service.js";

// Helper: Cosine similarity between two vectors
const cosineSim = (a, b) => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// Retrieve top K chunks by similarity
export const retrieveChunks = async (query, topK = 5) => {
  try {
    // 1️⃣ Get query embedding
    const queryVector = await getEmbedding(query);

    // 2️⃣ Fetch all chunks from MongoDB
    const chunks = await SopChunk.find(); // get all documents

    // 3️⃣ Compute similarity score for each chunk
    const scoredChunks = chunks.map(chunk => ({
      ...chunk._doc,
      score: cosineSim(queryVector, chunk.embedding),
    }));

    // 4️⃣ Sort by score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // 5️⃣ Return top K
    const results = scoredChunks.slice(0, topK);

    console.log(`[RAG] Query: "${query}" → Retrieved ${results.length} chunks`);
    return results;
  } catch (err) {
    console.error("Vector search error:", err);
    return [];
  }
};
