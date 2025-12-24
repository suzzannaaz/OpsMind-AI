/**
 * Build context string for user query
 * @param {Array} chunks - Array of { text, source, page }
 * @returns Formatted context string
 */
export const buildContext = (chunks) => {
  if (!chunks.length) {
    return "No relevant SOP information found.";
  }

  return chunks
    .map(
      (chunk, i) =>
        `SOURCE ${i + 1}:
Document: ${chunk.source}
Page: ${chunk.page}
Content:
${chunk.text}`
    )
    .join("\n\n---\n\n");
};
