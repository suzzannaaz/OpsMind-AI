import express from "express";
import { retrieveChunks } from "../services/search.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const results = await retrieveChunks(query, 5); // top 5
  res.json(results);
});

export default router;
