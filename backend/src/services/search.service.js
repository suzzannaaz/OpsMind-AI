import SopChunk from "../models/sopChunk.js";
import { generateEmbedding } from "./embed.service.js";

// Cosine similarity helper
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export const searchSOP = async (query, topK = 3, minScore = 0.5) => {
  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Fetch all chunks
  const allChunks = await SopChunk.find();

  // 3. Score chunks
  const scored = allChunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // 4. Sort by similarity
  scored.sort((a, b) => b.score - a.score);

  // 5. Filter by threshold
  const filtered = scored.filter(item => item.score >= minScore);

  // 6. Return top K with citation info
  return filtered.slice(0, topK).map(item => ({
    text: item.chunk.text,
    source: item.chunk.metadata.source,
    page: item.chunk.metadata.page,
    score: item.score,
  }));
};
