import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"; // ✅ Node.js legacy build

export const extractTextFromPDF = async (filePath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(" ") + "\n";
    }

    return fullText;
  } catch (err) {
    console.error("PDF parsing error:", err);
    throw err;
  }
};
