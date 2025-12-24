import express from "express";
import { retrieveChunksWithContext } from "../services/search.service.js";
import { buildContext } from "../services/context.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    const chunks = await retrieveChunksWithContext(query, topK);
    const contextString = buildContext(chunks, 2000);

    res.json({ query, context: contextString, sources: chunks });
  } catch (err) {
    console.error("Search route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
