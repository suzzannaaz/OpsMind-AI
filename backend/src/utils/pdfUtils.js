// src/utils/pdfUtils.js
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

/**
 * Parse PDF buffer into chunks with sections
 * @param {Buffer} buffer - PDF file buffer
 * @param {string} documentName - Name of the PDF
 * @returns Array of { documentName, chunkText, page, section }
 */
export const parsePDFWithSections = async (buffer, documentName) => {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const chunks = [];
  const CHUNK_SIZE = 200; // words per chunk

  // Simple regex to detect headings/sections
  const sectionRegex = /^(?:Section|Chapter|HR|Finance|Operations|Policy|Procedure)[\s:.-]?(.+)$/i;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map(item => item.str);
    const pageText = textItems.join(" ").replace(/\s+/g, " ").trim();

    const words = pageText.split(" ");

    let currentSection = null;
    let sectionStart = 0;

    // Split page into sections based on headings
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const match = word.match(sectionRegex);
      if (match) {
        currentSection = match[1].trim(); // e.g., "HR Department"
        sectionStart = i;
      }

      // When enough words collected, create chunk
      if ((i - sectionStart + 1) % CHUNK_SIZE === 0 || i === words.length - 1) {
        const chunkText = words.slice(i - CHUNK_SIZE + 1, i + 1).join(" ").trim();
        if (chunkText.length > 0) {
          chunks.push({
            documentName,
            chunkText,
            page: pageNum,
            section: currentSection
          });
        }
      }
    }
  }

  return chunks;
};
