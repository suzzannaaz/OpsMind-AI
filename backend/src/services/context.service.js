export const buildContext = (chunks, maxTokens = 2000) => {
  if (!chunks.length) return "No relevant SOP information found.";

  const contextChunks = [];
  let totalTokens = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const tokens = chunk.text.split(/\s+/).length;

    if (totalTokens + tokens > maxTokens) break;

    contextChunks.push(
      `SOURCE ${i + 1}:\nDocument: ${chunk.source}\nPage: ${chunk.page}\nContent:\n${chunk.text}`
    );

    totalTokens += tokens;
  }

  return contextChunks.join("\n\n---\n\n");
};
