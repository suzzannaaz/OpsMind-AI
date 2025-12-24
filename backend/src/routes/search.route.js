import express from "express";
import { retrieveChunksWithContext } from "../services/search.service.js";
import { buildContext } from "../services/context.service.js";

const router = express.Router();

/**
 * POST /search
 * Body: { query: "text to search", topK: 5 }
 */
router.post("/", async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query is required" });
    }

    const contextChunks = await retrieveChunksWithContext(query, topK);
    const contextString = buildContext(contextChunks);

    res.json({ query, context: contextString, sources: contextChunks });
  } catch (err) {
    console.error("Search route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
