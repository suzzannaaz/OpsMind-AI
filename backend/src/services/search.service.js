import SopChunk from "../models/sopChunk.js";
import { generateEmbedding } from "./embed.service.js";

/**
 * Retrieve top K relevant chunks for a query
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to return
 * @param {number} maxContextTokens - Maximum total tokens allowed in context
 * @returns Array of chunks with text, source, and page
 */
export const retrieveChunksWithContext = async (
  query,
  topK = 5,
  maxContextTokens = 2000
) => {
  if (!query || query.trim().length === 0) return [];

  // 1️⃣ Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // 2️⃣ Fetch all SOP chunks
  const allChunks = await SopChunk.find();

  // 3️⃣ Compute cosine similarity
  const similarity = allChunks
    .map(chunk => {
      if (!chunk.text || chunk.text.trim().length < 20) return null;

      const dot = chunk.embedding.reduce(
        (acc, val, i) => acc + val * queryEmbedding[i],
        0
      );
      const magA = Math.sqrt(chunk.embedding.reduce((acc, val) => acc + val ** 2, 0));
      const magB = Math.sqrt(queryEmbedding.reduce((acc, val) => acc + val ** 2, 0));
      const score = dot / (magA * magB);

      return { chunk, score };
    })
    .filter(Boolean);

  // 4️⃣ Sort by similarity
  similarity.sort((a, b) => b.score - a.score);

  // 5️⃣ Build context window
  const contextChunks = [];
  let totalTokens = 0;

  for (const { chunk } of similarity.slice(0, topK)) {
    const tokens = chunk.text.split(/\s+/).length;
    if (totalTokens + tokens > maxContextTokens) break;

    contextChunks.push({
      text: chunk.text,
      source: chunk.metadata.source,
      page: chunk.metadata.page,
    });

    totalTokens += tokens;
  }

  return contextChunks;
};
