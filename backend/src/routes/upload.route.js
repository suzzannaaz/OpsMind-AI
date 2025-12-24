import express from "express";
import multer from "multer";
import SopChunk from "../models/sopChunk.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { chunkText } from "../services/chunk.service.js";
import { generateEmbedding } from "../services/embed.service.js";
import { deleteFile, isPDF } from "../utils/file.util.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!isPDF(req.file)) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // 1️⃣ Extract pages with text
    const pages = await extractTextFromPDF(req.file.path);

    if (!pages.length) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ error: "PDF is empty or could not be parsed" });
    }

    // 2️⃣ Chunk pages while keeping page numbers
    const meaningfulChunks = [];
    for (const page of pages) {
      const pageChunks = chunkText(page.text, page.page);
      meaningfulChunks.push(...pageChunks);
    }

    // 3️⃣ Generate embeddings and store in MongoDB
    for (const chunk of meaningfulChunks) {
      const embedding = await generateEmbedding(chunk.text);

      await SopChunk.create({
        text: chunk.text,
        embedding,
        metadata: {
          source: req.file.originalname,
          page: chunk.page,
        },
      });
    }

    res.json({
      message: "SOP ingested successfully",
      totalChunks: meaningfulChunks.length,
    });

  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (req.file) deleteFile(req.file.path);
  }
});

export default router;
