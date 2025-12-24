/**
 * Split text into chunks with page info
 * @param {string} text - Page text
 * @param {number} page - Page number
 * @param {number} chunkSize - Characters per chunk
 * @param {number} overlap - Characters overlap between chunks
 * @returns Array of { text, page }
 */
export const chunkText = (text, page = 1, chunkSize = 1000, overlap = 100) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const chunkText = text.slice(start, start + chunkSize);
    if (chunkText.trim().length > 0) {
      chunks.push({ text: chunkText, page });
    }
    start += chunkSize - overlap;
  }

  return chunks;
};
