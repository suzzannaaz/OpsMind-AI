export const buildContext = (chunks, maxChars = 9000) => {
  const seen = new Set();
  let context = "";

  for (const c of chunks) {
    if (!c.chunkText || seen.has(c.chunkText)) continue;
    seen.add(c.chunkText);

    const line = `[${c.documentName} | Page ${c.page}${c.section ? ` | Section ${c.section}` : ""}]\n${c.chunkText}\n\n`;
    if ((context + line).length > maxChars) break;
    context += line;
  }

  return context;
};
