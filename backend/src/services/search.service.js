import SopChunk from "../models/sopChunk.js";
import { generateEmbedding } from "./embed.service.js"; // your embedding generator

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

  // 2. Fetch all chunks from MongoDB
  const allChunks = await SopChunk.find();

  // 3. Compute similarity scores
  const scored = allChunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // 4. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 5. Filter by minimum score
  const filtered = scored.filter(item => item.score >= minScore);

  // 6. Return top K of filtered results
  return filtered.slice(0, topK).map(item => ({
    text: item.chunk.text,
    source: item.chunk.source,
    page: item.chunk.page,
    score: item.score
  }));
};
