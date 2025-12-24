import SopChunk from "../models/sopChunk.js";
import { generateEmbedding } from "./embed.service.js";

/**
 * Retrieve top K relevant chunks using cosine similarity (works on M0)
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to return
 * @param {number} maxTokens - Maximum total tokens in context
 * @returns Array of chunks with text, source, page
 */
export const retrieveChunksWithContext = async (query, topK = 5, maxTokens = 2000) => {
  if (!query || query.trim().length === 0) return [];

  // 1️⃣ Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2️⃣ Fetch all SOP chunks
  const allChunks = await SopChunk.find();

  // 3️⃣ Compute cosine similarity for each chunk
  const scoredChunks = allChunks
    .map(chunk => {
      if (!chunk.embedding || !chunk.embedding.length) return null;

      const dot = chunk.embedding.reduce((sum, val, i) => sum + val * queryEmbedding[i], 0);
      const magA = Math.sqrt(chunk.embedding.reduce((sum, val) => sum + val ** 2, 0));
      const magB = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val ** 2, 0));
      const score = dot / (magA * magB);

      return { chunk, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score) // highest similarity first
    .slice(0, topK);

  // 4️⃣ Limit total tokens for context
  const contextChunks = [];
  let totalTokens = 0;

  for (const { chunk } of scoredChunks) {
    const tokens = chunk.text.split(/\s+/).length;
    if (totalTokens + tokens > maxTokens) break;

    contextChunks.push({
      text: chunk.text,
      source: chunk.metadata.source,
      page: chunk.metadata.page,
    });

    totalTokens += tokens;
  }

  return contextChunks;
};
