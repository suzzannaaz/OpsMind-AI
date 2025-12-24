import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

/**
 * Extract text from PDF page by page
 * @param {string} filePath - Path to PDF
 * @returns Array of objects { text, page }
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      const pageText = strings.join(" ").trim();

      if (pageText.length > 0) {
        pages.push({
          text: pageText,
          page: i,
        });
      }
    }

    return pages;
  } catch (err) {
    console.error("PDF parsing error:", err);
    throw err;
  }
};
