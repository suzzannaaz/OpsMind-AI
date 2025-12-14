import express from "express";
import multer from "multer";
import SopChunk from "../models/sopChunk.js";
import { extractTextFromPDF } from "../services/pdf.service.js"; // using pdfjs-dist
import { chunkText } from "../services/chunk.service.js";
import { generateEmbedding } from "../services/embed.service.js";
import { deleteFile, isPDF } from "../utils/file.util.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    // ✅ Validate file type
    if (!isPDF(req.file)) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // 1️⃣ Extract text from PDF using pdfjs-dist
    const text = await extractTextFromPDF(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "PDF is empty or could not be parsed" });
    }

    // 2️⃣ Chunk text
    const chunks = chunkText(text);

    // 3️⃣ Generate embeddings and store in MongoDB
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      await SopChunk.create({
        text: chunk,
        embedding,
        metadata: { source: req.file.originalname },
      });
    }

    res.json({ message: "SOP ingested successfully" });
  } catch (err) {
    console.error("Upload route error:", err); // ✅ log error to console
    res.status(500).json({ error: err.message });
  } finally {
    // Delete the uploaded file after processing
    if (req.file) deleteFile(req.file.path);
  }
});

export default router;
